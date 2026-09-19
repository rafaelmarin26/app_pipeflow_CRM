import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  Percent,
  SquareKanban,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SalesFunnel } from "@/components/dashboard/sales-funnel";
import { UpcomingDealsTable } from "@/components/dashboard/upcoming-deals-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  buildFunnel,
  conversionRate,
  countOpenDeals,
  openPipelineValueCents,
  upcomingDeals,
} from "@/lib/metrics";
import {
  ACTIVE_WORKSPACE_ID,
  CURRENT_USER_ID,
  findLead,
  findUser,
  mockDeals,
  mockLeads,
} from "@/lib/mock-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { DealCardData } from "@/types/views";

export const metadata: Metadata = { title: "Dashboard" };

/** How many deadlines the panel shows before it starts hiding them. */
const UPCOMING_LIMIT = 6;

/**
 * Dashboard — PLAN.md M8. The first screen after login.
 *
 * This file is the only one in the feature that knows where the data comes
 * from. M14 replaces the two fixture reads below with Supabase aggregates and
 * keeps calling the very same functions in lib/metrics.ts, so what a number
 * means is defined in exactly one place regardless of who computed it.
 */
export default function DashboardPage() {
  const leads = mockLeads.filter(
    (lead) => lead.workspace_id === ACTIVE_WORKSPACE_ID,
  );

  // Stands in for `select *, owner:owner_id (...), lead:lead_id (...)` — the
  // same shape the Kanban board already consumes.
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

  const funnel = buildFunnel(deals);
  const rate = conversionRate(deals);
  const upcoming = upcomingDeals(deals, CURRENT_USER_ID, UPCOMING_LIMIT);

  const won = funnel.find((entry) => entry.stage === "won")?.count ?? 0;
  const lost = funnel.find((entry) => entry.stage === "lost")?.count ?? 0;

  const header = (
    <PageHeader
      title="Dashboard"
      description="Como o funil está hoje: volume, valor em aberto e os prazos que chegam primeiro."
    />
  );

  // A workspace created a minute ago has nothing to average, and four zeros
  // would read as a broken screen rather than an empty one (CLAUDE.md §7).
  if (leads.length === 0 && deals.length === 0) {
    return (
      <div className="space-y-6">
        {header}

        <EmptyState
          icon={TrendingUp}
          title="Ainda não há o que medir."
          description="Cadastre o primeiro lead e abra um negócio no pipeline — as métricas e o funil aparecem aqui assim que houver movimento."
          action={
            <Button asChild>
              <Link href="/leads">Cadastrar primeiro lead</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de leads"
          icon={Users}
          value={<span className="display-lg">{leads.length}</span>}
          hint="Contatos cadastrados neste workspace."
          enterDelayMs={0}
        />

        <MetricCard
          label="Negócios abertos"
          icon={SquareKanban}
          value={<span className="display-lg">{countOpenDeals(deals)}</span>}
          hint={`De ${deals.length} negócios no total, incluindo os já fechados.`}
          enterDelayMs={60}
        />

        <MetricCard
          label="Valor do pipeline"
          icon={Wallet}
          value={
            <span className="money text-2xl font-semibold">
              {formatCurrency(openPipelineValueCents(deals))}
            </span>
          }
          hint="Soma dos negócios ainda em aberto."
          enterDelayMs={120}
        />

        <MetricCard
          label="Taxa de conversão"
          icon={Percent}
          value={
            <span className="display-lg">
              {rate === null ? "—" : formatPercent(rate)}
            </span>
          }
          hint={
            rate === null ? (
              "Nenhum negócio fechado ainda."
            ) : (
              <>
                <span className="text-stage-won">{won} ganhos</span>
                {" · "}
                <span className="text-stage-lost">{lost} perdidos</span>
              </>
            )
          }
          enterDelayMs={180}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <DashboardPanel
          title="Funil de vendas"
          meta={deals.length === 1 ? "1 negócio" : `${deals.length} negócios`}
          className="xl:col-span-5"
          bodyClassName="px-3 py-3"
          enterDelayMs={240}
        >
          {deals.length > 0 ? (
            <SalesFunnel data={funnel} />
          ) : (
            <EmptyState
              compact
              title="Funil vazio"
              description="Nenhum negócio no pipeline ainda."
            />
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Seus prazos mais próximos"
          meta={upcoming.length > 0 ? `${upcoming.length} negócios` : undefined}
          className="xl:col-span-7"
          enterDelayMs={300}
        >
          {upcoming.length > 0 ? (
            <UpcomingDealsTable deals={upcoming} />
          ) : (
            <div className="p-4">
              <EmptyState
                compact
                icon={CalendarClock}
                title="Nenhum prazo à vista"
                description="Seus negócios em aberto não têm data definida. Abra um no pipeline para acompanhar o prazo por aqui."
              />
            </div>
          )}
        </DashboardPanel>
      </div>
    </div>
  );
}
