"use client";

import type { CSSProperties } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus } from "lucide-react";

import { DealCard } from "@/components/pipeline/deal-card";
import { DealDialog } from "@/components/pipeline/deal-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  DEAL_STAGE_LABELS,
  DEAL_STAGES,
  isClosedStage,
  stageTone,
  type StageTone,
} from "@/lib/labels";
import { columnSummary } from "@/lib/pipeline";
import { cn, formatCurrencyCompact } from "@/lib/utils";
import type { DealStage, Lead } from "@/types/database";
import type { DealCardData, Person } from "@/types/views";

/**
 * One stage of the funnel — PLAN.md M7.
 *
 * The droppable is the column itself, not the list of cards, so an empty column
 * still accepts a drop: "Fechado Ganho" is exactly the column a deal has to be
 * able to reach on the day it is still empty.
 */

/** Won and Lost read as outcomes; the four open stages read as one funnel. */
const toneHeader: Record<StageTone, string> = {
  open: "border-border",
  won: "border-won/25 bg-won/10 text-won-ink",
  lost: "border-lost/25 bg-lost/10 text-lost-ink",
};

const toneDot: Record<StageTone, string> = {
  open: "bg-open",
  won: "bg-won",
  lost: "bg-lost",
};

/** The drop target has to be unmistakable while a card hovers over it. */
const toneOver: Record<StageTone, string> = {
  open: "ring-2 ring-inset ring-open/40 bg-open/5",
  won: "ring-2 ring-inset ring-won/40 bg-won/5",
  lost: "ring-2 ring-inset ring-lost/40 bg-lost/5",
};

/**
 * The rail across the top of each header, borrowed from Pipedrive's board — but
 * carrying different information. Pipedrive gives every stage its own hue; here
 * every open stage is indigo (CLAUDE.md §7 reserves green and red for the two
 * outcomes) and the rail instead *fills* as the funnel advances: a quarter at
 * "Novo Lead", full at "Negociação". Progress without spending a colour on it.
 */
const OPEN_STAGE_COUNT = DEAL_STAGES.filter(
  (stage) => !isClosedStage(stage),
).length;

const toneRail: Record<StageTone, string> = {
  open: "bg-open",
  won: "bg-won",
  lost: "bg-lost",
};

/** How much of the rail is filled — the depth of this stage in the funnel. */
function railFill(stage: DealStage): number {
  if (isClosedStage(stage)) return 1;
  return (DEAL_STAGES.indexOf(stage) + 1) / OPEN_STAGE_COUNT;
}

/** Delay between two neighbouring cards in the entrance cascade. */
const CARD_STAGGER_MS = 40;

/** How long the cascade waits for its own column to have arrived. */
const CARD_LEAD_MS = 80;

export function KanbanColumn({
  stage,
  deals,
  index,
  activeDealId,
  leads,
  owners,
  defaultOwnerId,
}: {
  stage: DealStage;
  deals: DealCardData[];
  /** Position on the board, for the left-to-right entrance stagger. */
  index: number;
  /** The card currently being dragged, if any. */
  activeDealId: string | null;
  /** Passed straight through to the per-column "new deal" dialog. */
  leads: Pick<Lead, "id" | "name">[];
  owners: Person[];
  defaultOwnerId?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", stage },
  });

  const tone = stageTone(stage);
  const { count, totalCents } = columnSummary(deals);

  // `isOver` only fires when the pointer is over the column's own padding; once
  // it is over a card, that card is the drop target. Since the board moves the
  // dragged card into this column while it hovers, its presence here is the
  // reliable signal.
  const hovering =
    activeDealId !== null &&
    (isOver || deals.some((deal) => deal.id === activeDealId));

  return (
    <section
      aria-label={DEAL_STAGE_LABELS[stage]}
      className="board-column-in flex h-full w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-panel/60"
      style={{ "--stagger": `${index * 60}ms` } as CSSProperties}
    >
      {/* Outside the scroller on purpose: the header is a flex sibling of the
          card list, so it holds its place while the cards scroll beneath it
          without the browser having to recompute a sticky offset per frame. */}
      <div
        className={cn(
          "shrink-0 border-b bg-panel/90 backdrop-blur",
          toneHeader[tone],
        )}
      >
        {/* Funnel depth, read at a glance across the six headers. */}
        <div className="h-0.5 w-full bg-border/60" aria-hidden>
          <div
            className={cn("h-full", toneRail[tone])}
            style={{ width: `${railFill(stage) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5">
          <span
            className={cn("size-2 shrink-0 rounded-full", toneDot[tone])}
            aria-hidden
          />

          <h2 className="truncate text-sm font-semibold">
            {DEAL_STAGE_LABELS[stage]}
          </h2>

          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
            {count}
          </span>

          <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatCurrencyCompact(totalCents)}
          </span>

          {/* Creating a deal straight into the column you are looking at, the
              way Pipedrive does it. Ghost and icon-only, so the single filled
              indigo button of the page header stays the primary action
              (CLAUDE.md §7). */}
          <DealDialog
            leads={leads}
            owners={owners}
            defaultOwnerId={defaultOwnerId}
            defaultStage={stage}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1 size-6 shrink-0 text-muted-foreground hover:text-foreground"
                aria-label={`Novo negócio em ${DEAL_STAGE_LABELS[stage]}`}
              >
                <Plus aria-hidden />
              </Button>
            }
          />
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2 transition-colors duration-150",
          hovering ? toneOver[tone] : null,
        )}
      >
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {deals.map((deal, cardIndex) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  enterDelayMs={
                    index * 60 + CARD_LEAD_MS + cardIndex * CARD_STAGGER_MS
                  }
                />
              ))}
            </ul>
          ) : (
            <EmptyState compact title="Nenhum negócio nesta etapa." />
          )}
        </SortableContext>
      </div>
    </section>
  );
}
