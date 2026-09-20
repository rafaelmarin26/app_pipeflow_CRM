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
import { Button } from "@/components/ui/button";
import { DEAL_STAGE_LABELS } from "@/lib/labels";
import { columnSummary } from "@/lib/pipeline";
import { STAGE_BG, STAGE_TEXT } from "@/lib/stage-styles";
import { cn, formatCurrencyCompact } from "@/lib/utils";
import type { DealStage, Lead } from "@/types/database";
import type { DealCardData, Person } from "@/types/views";

/**
 * One stage of the funnel — PLAN.md M7, restyled for Identidade Visual v2.
 *
 * The droppable is the column itself, not the list of cards, so an empty column
 * still accepts a drop: "Fechado Ganho" is exactly the column a deal has to be
 * able to reach on the day it is still empty.
 *
 * v2 drops the frosted header of v1 — the brand guide rules out glassmorphism,
 * and the header never needed it: it is a flex sibling of the scroller, so it
 * holds its place without a blur or a sticky offset. The drop target is marked
 * in chartreuse rather than in the stage colour, because in v2 accent means
 * "you are interacting with this" and stage colour means "this is what it is".
 */

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
      className={cn(
        "board-column-in flex h-full w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border bg-panel/40 transition-colors duration-150",
        hovering ? "border-brand/50 bg-brand/[0.03]" : "border-hairline",
      )}
      style={{ "--stagger": `${index * 60}ms` } as CSSProperties}
    >
      {/* The stage rail: the one place the column states its own colour at full
          strength, so the six headers read as a spectrum across the board. */}
      <div className={cn("h-0.5 w-full shrink-0", STAGE_BG[stage])} aria-hidden />

      <div className="flex shrink-0 items-center gap-2 border-b border-hairline px-3 py-3">
        <h2 className={cn("label-mono truncate", STAGE_TEXT[stage])}>
          {DEAL_STAGE_LABELS[stage]}
        </h2>

        <span className="label-mono shrink-0 rounded-sm bg-elevated px-1.5 py-0.5 text-faint">
          {count}
        </span>

        <span className="money ml-auto shrink-0 text-xs text-muted-foreground">
          {formatCurrencyCompact(totalCents)}
        </span>

        {/* Creating a deal straight into the column you are looking at. Ghost and
            icon-only, so the single filled chartreuse button of the page header
            stays the primary action (CLAUDE.md §7). */}
        <DealDialog
          leads={leads}
          owners={owners}
          defaultOwnerId={defaultOwnerId}
          defaultStage={stage}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 size-6 shrink-0 text-faint hover:text-brand"
              aria-label={`Novo negócio em ${DEAL_STAGE_LABELS[stage]}`}
            >
              <Plus aria-hidden />
            </Button>
          }
        />
      </div>

      <div
        ref={setNodeRef}
        className="min-h-0 flex-1 overflow-y-auto p-2"
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
                  leads={leads}
                  owners={owners}
                  enterDelayMs={
                    index * 60 + CARD_LEAD_MS + cardIndex * CARD_STAGGER_MS
                  }
                />
              ))}
            </ul>
          ) : (
            // Still a valid drop target with nothing in it — the whole column is
            // the droppable, not this block.
            <p className="label-mono px-2 py-6 text-center text-faint">
              Nenhum negócio nesta etapa
            </p>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
