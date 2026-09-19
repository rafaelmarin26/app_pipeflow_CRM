import Link from "next/link";

import { StageBadge } from "@/components/shared/stage-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dueState, type DueState } from "@/lib/pipeline";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { DealCardData } from "@/types/views";

/**
 * "Seus negócios com prazo próximo" — PLAN.md M8.
 *
 * A Server Component over rows it was handed: the page decides that these are
 * the logged-in user's open deals, soonest first (`upcomingDeals()` in
 * lib/metrics.ts), and M14 swaps that selection for a query with an
 * `owner_id = auth.uid()` filter without this table noticing.
 *
 * The deadline verdict comes from `dueState()`, the same function the Kanban
 * card calls, so a deal that is red on the board cannot be calm here.
 */

/**
 * Overdue borrows the negative red: a missed deadline is a failure, not a
 * warning. Warm orange stays for what is still ahead. Identical to the chip on
 * the board card, deliberately.
 */
const dueChip: Record<Exclude<DueState, "none">, string> = {
  overdue: "bg-negative/10 text-negative",
  soon: "bg-warm/10 text-warm",
};

function DueCell({ deal }: { deal: DealCardData }) {
  // The page only ever passes deals that have a deadline; this keeps the
  // component honest for any caller that does not.
  if (!deal.due_date) {
    return <span className="money text-xs text-faint">Sem prazo</span>;
  }

  const date = formatDate(deal.due_date);
  const state = dueState(deal.due_date, deal.stage);

  if (state === "none") {
    return <span className="money text-xs text-faint">{date}</span>;
  }

  return (
    <span
      className={cn(
        "label-mono inline-flex items-center rounded-sm px-1.5 py-1",
        dueChip[state],
      )}
    >
      {date}
    </span>
  );
}

export function UpcomingDealsTable({ deals }: { deals: DealCardData[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-hairline hover:bg-transparent">
          <TableHead className="label-mono w-full text-faint">
            Negócio
          </TableHead>
          <TableHead className="label-mono hidden text-faint sm:table-cell">
            Etapa
          </TableHead>
          <TableHead className="label-mono hidden text-right text-faint sm:table-cell">
            Valor
          </TableHead>
          <TableHead className="label-mono text-right text-faint">
            Prazo
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {deals.map((deal) => (
          <TableRow
            key={deal.id}
            className="h-11 border-hairline transition-colors hover:bg-elevated"
          >
            {/* The shadcn cell defaults to nowrap, which would push a long deal
                title past the panel and force the whole table to scroll. On the
                first screen after login the title is the one thing worth two
                lines. */}
            <TableCell className="py-2 whitespace-normal">
              {/* The deal has no page of its own; its lead is where the full
                  story lives, which is where M12 already sends every other
                  reference to a deal. */}
              {deal.lead ? (
                <Link
                  href={`/leads/${deal.lead.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {deal.title}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{deal.title}</span>
              )}

              <div className="text-xs text-muted-foreground">
                {deal.lead ? deal.lead.name : "Sem lead vinculado"}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 sm:hidden">
                <StageBadge stage={deal.stage} />
                <span className="money text-xs text-foreground">
                  {formatCurrency(deal.value_cents)}
                </span>
              </div>
            </TableCell>

            <TableCell className="hidden py-2 sm:table-cell">
              <StageBadge stage={deal.stage} />
            </TableCell>

            <TableCell className="hidden py-2 text-right sm:table-cell">
              <span className="money text-sm text-foreground">
                {formatCurrency(deal.value_cents)}
              </span>
            </TableCell>

            <TableCell className="py-2 text-right whitespace-nowrap">
              <DueCell deal={deal} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
