"use server";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getStripe } from "@/lib/stripe/client";
import { PRO_PRICE_CENTS } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext, type WorkspaceContext } from "@/lib/workspace";
import type { Database } from "@/types/database";

/**
 * Billing — PLAN.md M16. Neither action takes input from the client: the
 * workspace comes from the session and the price from `lib/stripe/plans.ts`,
 * so there is nothing for a caller to tamper with and nothing to validate.
 * What remains of CLAUDE.md §3's order is authenticate → resolve workspace →
 * require Admin → execute.
 *
 * Neither action grants anything. The plan only changes when the webhook
 * writes `subscriptions` (CLAUDE.md §5) — a checkout that comes back with
 * `?checkout=success` is a hint to refresh, never proof of payment.
 */
async function requireAdmin(): Promise<
  (WorkspaceContext & { supabase: SupabaseClient<Database> }) | { error: string }
> {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  if (context.role !== "admin") {
    return { error: "Só um Admin pode gerenciar o plano." };
  }

  return { supabase, ...context };
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createCheckoutSession(): Promise<{ error: string } | { url: string }> {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const { supabase, workspace, user } = admin;

  if (workspace.plan === "pro") {
    return { error: "Este workspace já está no plano Pro." };
  }

  const product = process.env.STRIPE_PRODUCT_PRO;
  if (!product) {
    return { error: "A cobrança ainda não está configurada. Tente novamente mais tarde." };
  }

  // A workspace that cancelled and comes back keeps its Stripe customer, so
  // the invoice history stays in one place instead of splitting per attempt.
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      locale: "pt-BR",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "brl",
            product,
            unit_amount: PRO_PRICE_CENTS,
            recurring: { interval: "month" },
          },
        },
      ],
      client_reference_id: workspace.id,
      metadata: { workspace_id: workspace.id },
      // The webhook reads the workspace off the subscription, not the session.
      subscription_data: { metadata: { workspace_id: workspace.id } },
      ...(existing?.stripe_customer_id
        ? { customer: existing.stripe_customer_id }
        : { customer_email: user.email }),
      success_url: `${appUrl()}/settings/billing?checkout=success`,
      cancel_url: `${appUrl()}/settings/billing?checkout=cancelled`,
    });

    if (!session.url) {
      return { error: "Não foi possível abrir o pagamento. Tente novamente em instantes." };
    }

    return { url: session.url };
  } catch {
    return { error: "Não foi possível abrir o pagamento. Tente novamente em instantes." };
  }
}

export async function createPortalSession(): Promise<{ error: string } | { url: string }> {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const { supabase, workspace } = admin;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return { error: "Este workspace ainda não tem uma assinatura para gerenciar." };
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl()}/settings/billing`,
    });

    return { url: session.url };
  } catch {
    return { error: "Não foi possível abrir o portal de assinatura. Tente novamente em instantes." };
  }
}
