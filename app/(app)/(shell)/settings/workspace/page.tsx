import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DangerZone } from "@/components/settings/danger-zone";
import { WorkspaceForm } from "@/components/settings/workspace-form";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";

export const metadata: Metadata = { title: "Workspace" };

/** Nome, endereço e zona de perigo — PLAN.md M9, visível apenas para Admin. */
export default async function WorkspaceSettingsPage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  if (context.role !== "admin") redirect("/settings/members");

  return (
    <div className="max-w-2xl space-y-6">
      <WorkspaceForm workspace={context.workspace} />
      <DangerZone workspaceName={context.workspace.name} />
    </div>
  );
}
