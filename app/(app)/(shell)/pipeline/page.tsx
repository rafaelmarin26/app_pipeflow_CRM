import type { Metadata } from "next";
import { Plus, SquareKanban } from "lucide-react";

import { DealDialog } from "@/components/pipeline/deal-dialog";
import { PipelineBoardView } from "@/components/pipeline/pipeline-board";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  ACTIVE_WORKSPACE_ID,
  CURRENT_USER_ID,
  findLead,
  findUser,
  mockDeals,
  mockLeads,
  mockMembers,
} from "@/lib/mock-data";
import type { DealCardData, Person } from "@/types/views";

export const metadata: Metadata = { title: "Pipeline" };

/**
 * Pipeline Kanban — PLAN.md M7.
 *
 * This file is the only one in the feature that knows where the data comes from.
 * M13 swaps the fixture reads below for a Supabase query with the same two joins
 * (`select *, owner:owner_id (...), lead:lead_id (...)`), and the board keeps
 * receiving the identical `DealCardData[]`.
 */
export default function PipelinePage() {
  const owners: Person[] = mockMembers
    .filter((member) => member.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((member) => findUser(member.user_id))
    .filter((person): person is Person => Boolean(person));

  const leads = mockLeads
    .filter((lead) => lead.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((lead) => ({ id: lead.id, name: lead.name }));

  const deals: DealCardData[] = mockDeals
    .filter((deal) => deal.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((deal) => {
      const lead = findLead(deal.lead_id);

      return {
        ...deal,
        owner: findUser(deal.owner_id) ?? null,
        lead: lead
          ? { id: lead.id, name: lead.name, company: lead.company }
          : null,
      };
    });

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
      defaultOwnerId={CURRENT_USER_ID}
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
          defaultOwnerId={CURRENT_USER_ID}
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
