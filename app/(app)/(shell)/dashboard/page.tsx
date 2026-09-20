import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { requireWorkspaceContext } from "@/lib/workspace";
import type { DealCardData } from "@/types/views";

export const metadata: Metadata = { title: "Dashboard" };

/** How many deadlines the panel shows before it starts hiding them. */
const UPCOMING_LIMIT = 6;

/**
 * Dashboard — PLAN.md M8, with M14's Supabase aggregates in place of the
 * fixture reads. The first screen after login.
 *
 * The lead count is the one truly heavy aggregate here (a workspace can have
 * many more leads than deals), so it runs as a `head: true` count — the
 * database returns a number, never the rows. Deals come back as full rows
 * because `lib/metrics.ts`'s functions are the definition of what each
 * figure means (CLAUDE.md-style single source of truth): recomputing them in
 * SQL would be a second, parallel definition of "taxa de conversão" that the
 * dashboard and a future report could quietly disagree on. A workspace's deal
 * count is bounded by the same Free-plan economics as its lead count, so this
 * is not the query that needs to become a database-side aggregate first.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  const { workspace, user } = context;

  const [leadsCountResult, dealsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id),
    supabase
      .from("deals")
      .select(
        "*, owner:owner_id(id, name, email, avatar_url), lead:lead_id(id, name, company)",
      )
      .eq("workspace_id", workspace.id),
  ]);

  const leadsCount = leadsCountResult.count ?? 0;
  const deals = (dealsResult.data ?? []) as DealCardData[];

  const funnel = buildFunnel(deals);
  const rate = conversionRate(deals);
  const upcoming = upcomingDeals(deals, user.id, UPCOMING_LIMIT);

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
  if (leadsCount === 0 && deals.length === 0) {
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
          value={<span className="display-lg">{leadsCount}</span>}
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
