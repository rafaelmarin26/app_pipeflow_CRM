import Link from "next/link";
import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StageBadge } from "@/components/shared/stage-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEAL_STAGES, LEAD_STATUSES } from "@/lib/labels";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";

/**
 * Design system showcase — the M2 validation screen. It is a development
 * surface, not a product screen: M3 replaces `/` with the marketing landing.
 */

const rawTokens = [
  { group: "Superfícies", items: ["--bg", "--surface", "--border", "--text", "--muted"] },
  { group: "Marca", items: ["--primary", "--primary-hover", "--accent"] },
  { group: "Funil", items: ["--won", "--lost", "--open", "--due"] },
];

const sampleDeals = [
  { title: "Plataforma comercial — Lumina Tech", cents: 4_750_000, date: "2026-09-16" },
  { title: "Plano anual — Clara Beleza", cents: 980_500, date: "2026-07-29" },
  { title: "Pacote inicial — VetCasa", cents: 295_000, date: "2026-09-10" },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 pb-16">
      <PageHeader
        title="Design system"
        description="Tokens, badges e primitivos que alimentam as telas das próximas etapas."
        action={
          <Button asChild>
            <Link href="/dashboard">Abrir o aplicativo</Link>
          </Button>
        }
      />

      <div className="mt-8 space-y-8">
        {rawTokens.map((section) => (
          <section key={section.group}>
            <h2 className="text-lg font-semibold">{section.group}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {section.items.map((token) => (
                <div
                  key={token}
                  className="rounded-lg border border-border bg-panel p-3 shadow-sm"
                >
                  <div
                    className="h-10 rounded-md border border-border"
                    style={{ backgroundColor: `var(${token})` }}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{token}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="text-lg font-semibold">Etapas do negócio</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DEAL_STAGES.map((stage) => (
              <StageBadge key={stage} stage={stage} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Status do lead</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEAD_STATUSES.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Botões</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button>Ação primária</Button>
            <Button variant="outline">Secundária</Button>
            <Button variant="ghost">Discreta</Button>
            <Button variant="destructive">Excluir</Button>
            <Button size="sm" variant="outline">
              Pequena
            </Button>
            <Button disabled>Desabilitada</Button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Valores e datas</h2>
          <Card className="mt-3">
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Negócios em aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs uppercase tracking-wide">
                      Negócio
                    </TableHead>
                    <TableHead className="text-xs uppercase tracking-wide">
                      Prazo
                    </TableHead>
                    <TableHead className="text-right text-xs uppercase tracking-wide">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleDeals.map((deal) => (
                    <TableRow key={deal.title}>
                      <TableCell className="font-medium">{deal.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(deal.date)}
                        <span className="ml-2 text-xs">
                          {formatRelativeDate(deal.date)}
                        </span>
                      </TableCell>
                      <TableCell className="money text-right font-medium">
                        {formatCurrency(deal.cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Estado vazio</h2>
          <EmptyState
            className="mt-3"
            icon={Inbox}
            title="Nenhum negócio nesta etapa ainda."
            description="Arraste um card para cá ou crie um negócio direto nesta coluna."
            action={<Button size="sm">Novo negócio</Button>}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold">Carregamento</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </section>
      </div>
    </main>
  );
}
