import type { Metadata } from "next";
import Link from "next/link";
import { Plus, SearchX, Users } from "lucide-react";

import { LeadDialog } from "@/components/leads/lead-dialog";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  applyLeadFilters,
  hasActiveLeadFilters,
  parseLeadFilters,
  sortLeadsByCreatedAt,
  type SearchParams,
} from "@/lib/leads-filters";
import {
  ACTIVE_WORKSPACE_ID,
  CURRENT_USER_ID,
  findUser,
  mockLeads,
  mockMembers,
} from "@/lib/mock-data";
import type { LeadWithOwner, Person } from "@/types/views";

export const metadata: Metadata = { title: "Leads" };

/**
 * Leads list — PLAN.md M6.
 *
 * This file is the only one in the feature that knows where the data comes from.
 * M12 swaps the three fixture reads below for Supabase queries — the filters
 * already arrive parsed from the URL, so the components underneath do not change.
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const owners: Person[] = mockMembers
    .filter((member) => member.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((member) => findUser(member.user_id))
    .filter((person): person is Person => Boolean(person));

  // Stands in for `select *, owner:owner_id (...)` — same shape, no join yet.
  const leads: LeadWithOwner[] = mockLeads
    .filter((lead) => lead.workspace_id === ACTIVE_WORKSPACE_ID)
    .map((lead) => ({ ...lead, owner: findUser(lead.owner_id) ?? null }));

  const filters = parseLeadFilters(params, owners);
  const visible = sortLeadsByCreatedAt(applyLeadFilters(leads, filters));

  const filtering = hasActiveLeadFilters(filters);
  const newLeadButton = (
    <Button>
      <Plus aria-hidden />
      Novo lead
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Todos os contatos do workspace, com busca e filtros."
        action={
          <LeadDialog
            owners={owners}
            defaultOwnerId={CURRENT_USER_ID}
            trigger={newLeadButton}
          />
        }
      />

      {leads.length > 0 ? (
        <div className="space-y-3">
          <LeadsToolbar filters={filters} owners={owners} />

          <p className="text-xs text-muted-foreground" aria-live="polite">
            {filtering
              ? `${visible.length} de ${leads.length} leads`
              : `${leads.length} leads`}
          </p>

          {visible.length > 0 ? (
            <LeadsTable leads={visible} owners={owners} />
          ) : (
            // Two different nothings: an empty workspace needs a first lead, an
            // empty result needs the filters gone.
            <EmptyState
              icon={SearchX}
              title="Nenhum lead corresponde a estes filtros."
              description="Ajuste a busca ou limpe os filtros para ver os demais contatos do workspace."
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href="/leads">Limpar filtros</Link>
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum lead cadastrado ainda."
          description="Cadastre o primeiro contato para começar a acompanhar o relacionamento e registrar atividades."
          action={
            <LeadDialog
              owners={owners}
              defaultOwnerId={CURRENT_USER_ID}
              trigger={newLeadButton}
            />
          }
        />
      )}
    </div>
  );
}
