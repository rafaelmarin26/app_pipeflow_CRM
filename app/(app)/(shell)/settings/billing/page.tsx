import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PlanOverview } from "@/components/settings/plan-overview";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";

export const metadata: Metadata = { title: "Plano" };

/**
 * Usage against the Free ceilings and the Free×Pro comparison — PLAN.md M9.
 * Checkout itself is M16; the upgrade button here is inert on purpose.
 */
export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  const { workspace, role } = context;

  const [{ count: leadsCount }, { count: membersCount }] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id),
    supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id),
  ]);

  return (
    <PlanOverview
      plan={workspace.plan}
      leadsCount={leadsCount ?? 0}
      membersCount={membersCount ?? 0}
      isAdmin={role === "admin"}
    />
  );
}
