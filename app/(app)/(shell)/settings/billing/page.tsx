import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutNotice } from "@/components/settings/checkout-notice";
import { PlanOverview } from "@/components/settings/plan-overview";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";

export const metadata: Metadata = { title: "Plano" };

/**
 * Usage against the Free ceilings, the Free×Pro comparison and — PLAN.md M16 —
 * the Checkout and Customer Portal entry points. The plan shown here is read
 * from the database; `?checkout=` only decides which banner to show.
 */
export default async function BillingSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  const { workspace, role } = context;
  const { checkout } = await searchParams;

  const [{ count: leadsCount }, { count: membersCount }, { data: subscription }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase
        .from("workspace_members")
        .select("user_id", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("workspace_id", workspace.id)
        .maybeSingle(),
    ]);

  return (
    <div className="max-w-2xl space-y-6">
      {checkout === "success" || checkout === "cancelled" ? (
        <CheckoutNotice checkout={checkout} plan={workspace.plan} />
      ) : null}

      <PlanOverview
        plan={workspace.plan}
        leadsCount={leadsCount ?? 0}
        membersCount={membersCount ?? 0}
        isAdmin={role === "admin"}
        subscription={
          subscription
            ? {
                status: subscription.status,
                currentPeriodEnd: subscription.current_period_end,
              }
            : null
        }
      />
    </div>
  );
}
