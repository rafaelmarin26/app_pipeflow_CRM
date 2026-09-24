import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/client";
import { syncSubscription } from "@/lib/stripe/sync";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const POSTGRES_UNIQUE_VIOLATION = "23505";

function subscriptionIdOf(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode !== "subscription" || !session.subscription) return null;
      return typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return event.data.object.id;
    default:
      return null;
  }
}

/**
 * Stripe webhook — PLAN.md M16, CLAUDE.md §5.
 *
 * Order matters: verify the signature on the raw body, claim the `event.id`,
 * then process. Claiming first (insert, let the primary key arbitrate) is what
 * makes two concurrent deliveries of the same event safe — a check-then-insert
 * would let both through. If processing throws, the claim is released and the
 * route answers 500 so Stripe redelivers instead of the event being lost.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // The signature is computed over the exact bytes Stripe sent; parsing to JSON
  // first would re-serialize them and break verification.
  const payload = await request.text();

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const service = createServiceRoleClient();

  const { error: claimError } = await service
    .from("stripe_events")
    .insert({ event_id: event.id, type: event.type });

  if (claimError) {
    if (claimError.code === POSTGRES_UNIQUE_VIOLATION) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }

  try {
    const subscriptionId = subscriptionIdOf(event);

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscription(service, subscription);
    }
  } catch {
    await service.from("stripe_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
