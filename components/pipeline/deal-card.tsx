"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { stageTone, type StageTone } from "@/lib/labels";
import { dueState, type DueState } from "@/lib/pipeline";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";
import type { DealCardData } from "@/types/views";

/**
 * A deal on the board — PLAN.md M7.
 *
 * Every colour on this card is derived, never chosen: the left accent comes from
 * `stageTone()` so a card can never disagree with the column it sits in, and the
 * deadline chip comes from `dueState()`. Nothing here decorates.
 */

/** 2px rule on the left edge, so the stage is readable without reading. */
const toneAccent: Record<StageTone, string> = {
  open: "bg-open",
  won: "bg-won",
  lost: "bg-lost",
};

/** Lift on hover, tinted by the same tone. The only flourish on this surface. */
const toneHover: Record<StageTone, string> = {
  open: "hover:-translate-y-0.5 hover:border-open/40 hover:shadow-md hover:shadow-open/15",
  won: "hover:-translate-y-0.5 hover:border-won/40 hover:shadow-md hover:shadow-won/15",
  lost: "hover:-translate-y-0.5 hover:border-lost/40 hover:shadow-md hover:shadow-lost/15",
};

/**
 * An overdue deal borrows the lost tone because a missed deadline is a failure
 * signal, not a warning. `--due` amber stays reserved for what is still ahead.
 */
const dueChip: Record<Exclude<DueState, "none">, string> = {
  overdue: "bg-lost/10 text-lost-ink",
  soon: "bg-due/10 text-due-ink",
};

function DueLabel({ deal }: { deal: DealCardData }) {
  if (!deal.due_date) return null;

  const state = dueState(deal.due_date, deal.stage);
  const date = formatDate(deal.due_date);

  if (state === "none") {
    return (
      <span className="text-xs text-muted-foreground tabular-nums">
        Prazo {date}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        dueChip[state],
      )}
    >
      {state === "overdue" ? "Venceu em" : "Vence em"} {date}
    </span>
  );
}

/**
 * The visual half of the card, with no drag wiring — shared by the sortable card
 * and by the `<DragOverlay>` copy, so the thing under the cursor is guaranteed
 * to look like the thing that was picked up.
 */
function DealCardBody({
  deal,
  className,
  style,
}: {
  deal: DealCardData;
  className?: string;
  style?: CSSProperties;
}) {
  const tone = stageTone(deal.stage);

  return (
    <article
      style={style}
      className={cn(
        "deal-card relative overflow-hidden rounded-lg border border-border bg-panel p-3 pl-4 shadow-sm",
        className,
      )}
    >
      <span
        className={cn("absolute inset-y-0 left-0 w-0.5", toneAccent[tone])}
        aria-hidden
      />

      <div className="space-y-2">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {deal.title}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {deal.lead ? deal.lead.name : "Sem lead vinculado"}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {formatCurrency(deal.value_cents)}
          </span>

          {deal.owner ? (
            <Avatar className="size-6" title={deal.owner.name}>
              {deal.owner.avatar_url ? (
                <AvatarImage src={deal.owner.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {initials(deal.owner.name)}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>

        <DueLabel deal={deal} />
      </div>
    </article>
  );
}

/**
 * The card as it appears inside a column. `attributes` from dnd-kit make it
 * focusable and give it the role a screen reader needs; the listeners sit on the
 * whole body, so the card is its own drag handle by pointer and by keyboard.
 */
export function DealCard({
  deal,
  enterDelayMs = 0,
}: {
  deal: DealCardData;
  /** Stagger of the entrance cascade, in milliseconds. */
  enterDelayMs?: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: "deal", stage: deal.stage },
    attributes: { roleDescription: "cartão de negócio" },
  });

  const tone = stageTone(deal.stage);

  return (
    <li
      className="board-card-in"
      style={{ "--stagger": `${enterDelayMs}ms` } as CSSProperties}
    >
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        {...attributes}
        {...listeners}
      >
        <DealCardBody
          deal={deal}
          className={cn(
            "cursor-grab touch-none transition duration-200",
            // The original stays in the flow to hold the slot open, but the copy
            // in the DragOverlay is the one the user is looking at.
            isDragging ? "opacity-0" : toneHover[tone],
          )}
        />
      </div>
    </li>
  );
}

/** The copy that rides under the cursor inside `<DragOverlay>`. */
export function DealCardPreview({ deal }: { deal: DealCardData }) {
  return (
    <DealCardBody
      deal={deal}
      // The overlay wrapper is already sized to the card that was picked up, so
      // the copy only has to fill it.
      className="w-full rotate-2 scale-105 cursor-grabbing shadow-md"
    />
  );
}
