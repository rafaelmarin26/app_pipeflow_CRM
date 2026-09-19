import { DEAL_STAGES, isClosedStage } from "@/lib/labels";
import type { Deal, DealStage } from "@/types/database";

/**
 * Dashboard arithmetic — PLAN.md M8, written for M14.
 *
 * Every function here takes plain rows and returns plain numbers: no React, no
 * fixtures, no Supabase. That is the whole point of the file. In M14 the same
 * four figures come back from SQL aggregates, and these functions stay as the
 * definition of what each one *means* — so the dashboard and any later report
 * can never disagree about what "taxa de conversão" is.
 *
 * The parameter types are the narrowest slice of `deals` each calculation
 * needs, which is also the column list the M14 query should select. A function
 * that only counts has no business asking for `value_cents`.
 */

type StagedDeal = Pick<Deal, "stage">;
type ValuedDeal = Pick<Deal, "stage" | "value_cents">;

/** A deal still in play: anything that is not won or lost. */
export function isOpenDeal(deal: StagedDeal): boolean {
  return !isClosedStage(deal.stage);
}

export function countOpenDeals(deals: StagedDeal[]): number {
  return deals.filter(isOpenDeal).length;
}

/**
 * What the open pipeline is worth, in cents.
 *
 * Closed deals are excluded on purpose: a pipeline figure that keeps counting
 * last quarter's wins only grows, and a number that only grows measures
 * nothing. Cents stay cents all the way to `formatCurrency` (CLAUDE.md §4).
 */
export function openPipelineValueCents(deals: ValuedDeal[]): number {
  return deals
    .filter(isOpenDeal)
    .reduce((sum, deal) => sum + deal.value_cents, 0);
}

/**
 * Won over decided — wins divided by wins plus losses, as a fraction of 1.
 *
 * Open deals are left out of the denominator because they have not been decided
 * yet; counting them would make the rate drift down every time a new deal is
 * created, which is the opposite of what the number should say.
 *
 * Returns `null` when nothing has been decided at all. A fresh workspace has no
 * conversion rate — it does not have a rate of zero, and the card has to be able
 * to tell those two apart.
 */
export function conversionRate(deals: StagedDeal[]): number | null {
  let won = 0;
  let lost = 0;

  for (const deal of deals) {
    if (deal.stage === "won") won += 1;
    else if (deal.stage === "lost") lost += 1;
  }

  const decided = won + lost;
  return decided === 0 ? null : won / decided;
}

export type FunnelStage = {
  stage: DealStage;
  count: number;
  totalCents: number;
};

/**
 * Count and value per stage, in the enum's own order, every stage present even
 * at zero — a funnel that silently drops its empty steps redraws itself with a
 * different number of bars each time the data moves.
 */
export function buildFunnel(deals: ValuedDeal[]): FunnelStage[] {
  const counts = new Map<DealStage, FunnelStage>(
    DEAL_STAGES.map((stage) => [stage, { stage, count: 0, totalCents: 0 }]),
  );

  for (const deal of deals) {
    const entry = counts.get(deal.stage);
    if (!entry) continue;

    entry.count += 1;
    entry.totalCents += deal.value_cents;
  }

  return DEAL_STAGES.map((stage) => counts.get(stage) as FunnelStage);
}

/**
 * The logged-in user's open deals that carry a deadline, soonest first.
 *
 * Generic over the row so the caller keeps whatever joins it already had: the
 * dashboard passes deals with their lead and owner attached and gets the same
 * rich rows back, without this file having to know those joins exist.
 *
 * Deals with no `due_date` are dropped rather than sorted to the end — this is
 * a list of deadlines, and a deal without one has no place on it.
 */
export function upcomingDeals<T extends Pick<Deal, "stage" | "due_date" | "owner_id">>(
  deals: T[],
  ownerId: string,
  limit: number,
): T[] {
  return deals
    .filter(
      (deal) => deal.owner_id === ownerId && isOpenDeal(deal) && deal.due_date,
    )
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string))
    .slice(0, limit);
}
