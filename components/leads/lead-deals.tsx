import { Handshake } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StageBadge } from "@/components/shared/stage-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DealWithOwner } from "@/types/views";

/**
 * Deals linked to the lead — PLAN.md M6. Read-only here: a deal is created and
 * moved on the Kanban (M7), and this list exists so the detail page answers
 * "what is actually in play with this contact".
 */
export function LeadDeals({ deals }: { deals: DealWithOwner[] }) {
  const total = deals.reduce((sum, deal) => sum + deal.value_cents, 0);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Negócios</h2>
        {deals.length > 0 ? (
          <span className="text-xs text-muted-foreground tabular-nums">
            {deals.length} · {formatCurrency(total)}
          </span>
        ) : null}
      </div>

      {deals.length > 0 ? (
        <ul className="space-y-2">
          {deals.map((deal) => (
            <li
              key={deal.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {deal.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deal.due_date
                    ? `Prazo em ${formatDate(deal.due_date)}`
                    : "Sem prazo definido"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-medium text-foreground tabular-nums">
                  {formatCurrency(deal.value_cents)}
                </span>
                <StageBadge stage={deal.stage} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Handshake}
          title="Nenhum negócio vinculado a este lead."
          description="Os negócios deste contato aparecem aqui assim que forem criados no pipeline."
        />
      )}
    </section>
  );
}
