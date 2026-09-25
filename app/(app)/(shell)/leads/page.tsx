import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, SearchX, Users } from "lucide-react";

import { LeadDialog } from "@/components/leads/lead-dialog";
import { LeadsPagination } from "@/components/leads/leads-pagination";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { EmptyState } from "@/components/shared/empty-state";
import { LimitNotice } from "@/components/shared/limit-notice";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  escapeIlikePattern,
  hasActiveLeadFilters,
  LEADS_PAGE_SIZE,
  parseLeadFilters,
  parseLeadsPage,
  periodSinceDays,
  type SearchParams,
} from "@/lib/leads-filters";
import { canAddLead } from "@/lib/limits";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";
import type { LeadWithOwner, Person } from "@/types/views";

export const metadata: Metadata = { title: "Leads" };

/**
 * Leads list — PLAN.md M6, with M12's Postgres query in place of the fixture
 * reads. Still the only file in the feature that knows where the data comes
 * from: the filters keep arriving parsed from the URL, so nothing under
 * `components/leads/` changed to make this swap.
 */
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  const { workspace } = context;
  const isAdmin = context.role === "admin";

  // The roster doubles as the owner options for the filter bar and the
  // dialog's "Responsável" select — one query, no per-lead lookup.
  const [{ data: memberRows }, leadLimit] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("profile:user_id(id, name, email, avatar_url)")
      .eq("workspace_id", workspace.id),
    canAddLead(supabase, workspace),
  ]);

  const owners: Person[] = (memberRows ?? [])
    .map((row) => row.profile)
    .filter((person): person is Person => Boolean(person));

  const filters = parseLeadFilters(params, owners);
  const page = parseLeadsPage(params);
  const from = (page - 1) * LEADS_PAGE_SIZE;
  const to = from + LEADS_PAGE_SIZE - 1;

  let query = supabase
    .from("leads")
    .select("*, owner:owner_id(id, name, email, avatar_url)", { count: "exact" })
    .eq("workspace_id", workspace.id);

  if (filters.q) {
    const term = escapeIlikePattern(filters.q);
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.owner) query = query.eq("owner_id", filters.owner);

  const sinceDays = periodSinceDays(filters.period);
  if (sinceDays !== null) {
    const since = new Date();
    since.setDate(since.getDate() - sinceDays);
    query = query.gte("created_at", since.toISOString());
  }

  // Newest first — the list is a work queue, and new leads are the work.
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const visible = (data ?? []) as LeadWithOwner[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / LEADS_PAGE_SIZE));

  // A page beyond the last one (a stale link, or the last lead on that page
  // just got deleted) still needs a real page count to make sense of, so the
  // "no leads at all" check below reads `filters` rather than this result.
  const filtering = hasActiveLeadFilters(filters);
  const workspaceHasLeads = filtering || totalCount > 0;

  function pageHref(nextPage: number): string {
    const query = new URLSearchParams();
    if (filters.q) query.set("q", filters.q);
    if (filters.status) query.set("status", filters.status);
    if (filters.owner) query.set("owner", filters.owner);
    if (filters.period) query.set("period", filters.period);
    if (nextPage > 1) query.set("page", String(nextPage));
    const search = query.toString();
    return search ? `/leads?${search}` : "/leads";
  }

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
            defaultOwnerId={context.user.id}
            trigger={newLeadButton}
          />
        }
      />

      {leadLimit.limit !== null && !leadLimit.allowed ? (
        <LimitNotice resource="leads" limit={leadLimit.limit} isAdmin={isAdmin} />
      ) : null}

      {workspaceHasLeads ? (
        <div className="space-y-3">
          <LeadsToolbar filters={filters} owners={owners} />

          <p className="text-xs text-muted-foreground" aria-live="polite">
            {filtering
              ? `${totalCount} ${totalCount === 1 ? "lead encontrado" : "leads encontrados"}`
              : `${totalCount} leads`}
          </p>

          {visible.length > 0 ? (
            <>
              <LeadsTable leads={visible} owners={owners} />
              <LeadsPagination
                page={page}
                totalPages={totalPages}
                buildHref={pageHref}
              />
            </>
          ) : page > totalPages ? (
            // A page past the end — a stale link, or the page's only lead just
            // got deleted from under it. Different from an empty result: there
            // is no filter to blame, just a page number to walk back.
            <EmptyState
              icon={SearchX}
              title="Esta página não existe mais."
              description={`Mostrando ${totalCount === 1 ? "1 lead" : `${totalCount} leads`} no total — volte para a primeira página.`}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href={pageHref(1)}>Voltar ao início</Link>
                </Button>
              }
            />
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
              defaultOwnerId={context.user.id}
              trigger={newLeadButton}
            />
          }
        />
      )}
    </div>
  );
}
