import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

import { planFromSubscriptionStatus } from "@/lib/stripe/plans";
import type { Database } from "@/types/database";

type Service = SupabaseClient<Database>;

function customerId(subscription: Stripe.Subscription): string {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

/**
 * Stripe v22 moved the billing period from the subscription to its items. One
 * Pro price means one item, but `min` keeps this correct if a second ever
 * appears: access ends when the earliest paid period does.
 */
function periodEnd(subscription: Stripe.Subscription): string | null {
  const ends = subscription.items.data.map((item) => item.current_period_end);
  if (ends.length === 0) return null;
  return new Date(Math.min(...ends) * 1000).toISOString();
}

async function resolveWorkspaceId(
  service: Service,
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMetadata = subscription.metadata?.workspace_id;
  if (fromMetadata) return fromMetadata;

  const { data } = await service
    .from("subscriptions")
    .select("workspace_id")
    .eq("stripe_customer_id", customerId(subscription))
    .maybeSingle();

  return data?.workspace_id ?? null;
}

/**
 * Writes the subscription's current state into `subscriptions` and mirrors
 * the resulting plan onto `workspaces.plan` — the column the rest of the app
 * already reads. The webhook is the only caller (CLAUDE.md §5).
 *
 * The caller passes a subscription freshly retrieved from Stripe, not the
 * event payload: Stripe does not guarantee delivery order, and applying a
 * stale `updated` after a newer `deleted` would flip a cancelled workspace
 * back to Pro. Fetching the current state on every event makes the handlers
 * order-independent.
 *
 * Returns `false` when the subscription belongs to no known workspace, so the
 * webhook can log it and still answer 200 — Stripe retrying would not help.
 */
export async function syncSubscription(
  service: Service,
  subscription: Stripe.Subscription,
): Promise<boolean> {
  const workspaceId = await resolveWorkspaceId(service, subscription);
  if (!workspaceId) return false;

  const { data: existing } = await service
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  // A workspace that cancelled and re-subscribed has two Stripe subscriptions
  // over its life. A late event from the old, dead one must not overwrite the
  // live one.
  const replacingLiveWithDead =
    existing?.stripe_subscription_id &&
    existing.stripe_subscription_id !== subscription.id &&
    planFromSubscriptionStatus(existing.status) === "pro" &&
    planFromSubscriptionStatus(subscription.status) === "free";
  if (replacingLiveWithDead) return true;

  const { error: subscriptionError } = await service.from("subscriptions").upsert(
    {
      workspace_id: workspaceId,
      stripe_customer_id: customerId(subscription),
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_end: periodEnd(subscription),
    },
    { onConflict: "workspace_id" },
  );
  if (subscriptionError) throw subscriptionError;

  const { error: workspaceError } = await service
    .from("workspaces")
    .update({ plan: planFromSubscriptionStatus(subscription.status) })
    .eq("id", workspaceId);
  if (workspaceError) throw workspaceError;

  return true;
}
