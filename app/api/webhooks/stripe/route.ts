import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { z } from "zod";

import { getStripe } from "@/lib/stripe/client";
import { syncSubscription } from "@/lib/stripe/sync";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

const POSTGRES_UNIQUE_VIOLATION = "23505";

/** Written by `createCheckoutSession` onto the session and the subscription. */
const metadataSchema = z.object({
  workspace_id: z.uuid(),
  user_id: z.uuid().optional(),
});

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * The subscription an event is about, or null for events that carry none.
 * Every handled event funnels into the same "re-read the subscription and sync
 * it" path, so a new event type only needs a case here.
 *
 * `invoice.payment_failed` needs no handler of its own: the subscription's live
 * status (`past_due` while Stripe retries the card) is what `syncSubscription`
 * records, and `planFromSubscriptionStatus` keeps a `past_due` workspace on Pro.
 */
function subscriptionIdOf(event: Stripe.Event): string | null {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      return session.mode === "subscription" ? idOf(session.subscription) : null;
    }
    case "invoice.payment_failed":
      return idOf(event.data.object.parent?.subscription_details?.subscription);
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      return event.data.object.id;
    default:
      return null;
  }
}

/**
 * Records which workspace an event touched and who started the checkout, from
 * the metadata on the subscription. Missing or malformed metadata (a
 * subscription created outside the app) is skipped.
 *
 * Best effort on purpose: the event is already processed by the time this runs,
 * and the ids can point at a workspace or user deleted since — a foreign-key
 * failure here would turn a handled event into a 500 that Stripe redelivers for
 * days without ever succeeding. The audit row is worth less than that.
 */
async function recordAudit(
  service: ReturnType<typeof createServiceRoleClient>,
  eventId: string,
  metadata: Stripe.Metadata,
) {
  const parsed = metadataSchema.safeParse(metadata);
  if (!parsed.success) return;

  await service
    .from("stripe_events")
    .update({
      workspace_id: parsed.data.workspace_id,
      user_id: parsed.data.user_id ?? null,
    })
    .eq("event_id", eventId);
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
      const synced = await syncSubscription(service, subscription);
      if (synced) await recordAudit(service, event.id, subscription.metadata);
    }
  } catch {
    await service.from("stripe_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
