import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Plus, SquareKanban } from "lucide-react";

import { DealDialog } from "@/components/pipeline/deal-dialog";
import { PipelineBoardView } from "@/components/pipeline/pipeline-board";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";
import type { DealCardData, Person } from "@/types/views";

export const metadata: Metadata = { title: "Pipeline" };

/**
 * Pipeline Kanban — PLAN.md M7, with M13's Postgres query in place of the
 * fixture reads. Still the only file in the feature that knows where the
 * data comes from — the board keeps receiving the identical `DealCardData[]`.
 */
export default async function PipelinePage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  const { workspace } = context;

  const [membersResult, leadsResult, dealsResult] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("profile:user_id(id, name, email, avatar_url)")
      .eq("workspace_id", workspace.id),
    supabase
      .from("leads")
      .select("id, name")
      .eq("workspace_id", workspace.id)
      .order("name", { ascending: true }),
    supabase
      .from("deals")
      .select(
        "*, owner:owner_id(id, name, email, avatar_url), lead:lead_id(id, name, company)",
      )
      .eq("workspace_id", workspace.id),
  ]);

  const owners: Person[] = (membersResult.data ?? [])
    .map((row) => row.profile)
    .filter((person): person is Person => Boolean(person));

  const leads = leadsResult.data ?? [];
  const deals = (dealsResult.data ?? []) as DealCardData[];

  const newDealButton = (
    <Button>
      <Plus aria-hidden />
      Novo negócio
    </Button>
  );

  const newDealDialog = (
    <DealDialog
      leads={leads}
      owners={owners}
      defaultOwnerId={context.user.id}
      trigger={newDealButton}
    />
  );

  return (
    // The board fills whatever height the header leaves, so it needs a flex
    // column here rather than a calc() of the chrome above it.
    <div className="flex h-full flex-col gap-6">
      <PageHeader
        title="Pipeline"
        description="Seus negócios distribuídos nas seis etapas do funil."
        action={newDealDialog}
      />

      {deals.length > 0 ? (
        <PipelineBoardView
          deals={deals}
          leads={leads}
          owners={owners}
          defaultOwnerId={context.user.id}
        />
      ) : (
        <EmptyState
          icon={SquareKanban}
          title="Nenhum negócio no pipeline."
          description="Crie o primeiro negócio para começar a acompanhar as oportunidades pelas etapas do funil."
          action={newDealDialog}
        />
      )}
    </div>
  );
}
