"use client";

import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash } from "lucide-react";

import { DealDialog } from "@/components/pipeline/deal-dialog";
import { DeleteDealDialog } from "@/components/pipeline/delete-deal-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { dueState, type DueState } from "@/lib/pipeline";
import { STAGE_TEXT } from "@/lib/stage-styles";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";
import type { Lead } from "@/types/database";
import type { DealCardData, Person } from "@/types/views";

/**
 * A deal on the board — PLAN.md M7, restyled for Identidade Visual v2.
 *
 * The split v2 asks for: **accent means interaction, stage colour means
 * information**. Chartreuse only ever appears because the user is pointing at
 * something; the deal's own stage speaks through the value, in mono, in the
 * colour of its column. Nothing on this card decorates.
 */

/**
 * An overdue deal borrows the negative red because a missed deadline is a
 * failure, not a warning. Warm orange stays for what is still ahead.
 */
const dueChip: Record<Exclude<DueState, "none">, string> = {
  overdue: "bg-negative/10 text-negative",
  soon: "bg-warm/10 text-warm",
};

function DueLabel({ deal }: { deal: DealCardData }) {
  if (!deal.due_date) return null;

  const state = dueState(deal.due_date, deal.stage);
  const date = formatDate(deal.due_date);

  if (state === "none") {
    return <span className="label-mono text-faint">Prazo {date}</span>;
  }

  return (
    <span
      className={cn(
        "label-mono inline-flex items-center rounded-sm px-1.5 py-0.5",
        dueChip[state],
      )}
    >
      {state === "overdue" ? "Venceu" : "Vence"} {date}
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
  interactive = true,
}: {
  deal: DealCardData;
  className?: string;
  style?: CSSProperties;
  /** The overlay copy is never hovered, so it skips the hover affordances. */
  interactive?: boolean;
}) {
  return (
    <article
      style={style}
      className={cn(
        "deal-card group relative overflow-hidden rounded-md border border-hairline bg-panel p-3",
        interactive &&
          "transition-colors duration-200 hover:border-brand/20 hover:bg-elevated",
        className,
      )}
    >
      {/* The accent rule the brand guide puts on a hovered card: zero width at
          rest, full width under the pointer. The one flourish on this surface. */}
      {interactive ? (
        <span
          className="absolute inset-x-0 top-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full"
          aria-hidden
        />
      ) : null}

      <div className="space-y-2.5">
        <p className="line-clamp-2 text-sm leading-snug font-medium text-foreground">
          {deal.title}
        </p>

        <p className="truncate text-xs text-muted-foreground">
          {deal.lead ? deal.lead.name : "Sem lead vinculado"}
        </p>

        <div className="flex items-center justify-between gap-2">
          {/* Value carries the stage colour: the card's one piece of hard data,
              in the voice reserved for data. */}
          <span className={cn("money text-sm font-semibold", STAGE_TEXT[deal.stage])}>
            {formatCurrency(deal.value_cents)}
          </span>

          {deal.owner ? (
            <Avatar className="size-6 rounded-md" title={deal.owner.name}>
              {deal.owner.avatar_url ? (
                <AvatarImage src={deal.owner.avatar_url} alt="" />
              ) : null}
              <AvatarFallback className="rounded-md bg-elevated font-mono text-[10px] text-muted-foreground">
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
 *
 * Edit and delete — PLAN.md M13, a gap the mock board never had to fill
 * (nothing ever needed to change once seeded). Both live in real `<button>`s
 * rather than on the card body itself: dnd-kit's keyboard sensor already
 * owns Space on the draggable div for pick-up/drop, so an edit affordance
 * that depended on Enter/Space there would fight it. `onPointerDown`'s
 * `stopPropagation` keeps a mouse click on either button from also being
 * read by dnd-kit as the start of a drag.
 */
export function DealCard({
  deal,
  leads,
  owners,
  enterDelayMs = 0,
}: {
  deal: DealCardData;
  /** Options the edit dialog's "Lead" and "Responsável" selects need. */
  leads: Pick<Lead, "id" | "name">[];
  owners: Person[];
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

  return (
    <li
      className="board-card-in group relative"
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
          interactive={!isDragging}
          className={cn(
            "cursor-grab touch-none",
            // The original stays in the flow to hold the slot open and fades to
            // the opacity the brand guide specifies for a card in transit.
            isDragging && "opacity-70",
          )}
        />
      </div>

      {!isDragging ? (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <DealDialog
            leads={leads}
            owners={owners}
            deal={deal}
            trigger={
              <Button
                variant="ghost"
                size="icon-xs"
                onPointerDown={(event) => event.stopPropagation()}
                className="bg-panel text-faint hover:text-brand"
                aria-label={`Editar ${deal.title}`}
                title="Editar"
              >
                <Pencil aria-hidden />
              </Button>
            }
          />

          <DeleteDealDialog
            dealId={deal.id}
            dealTitle={deal.title}
            trigger={
              <Button
                variant="ghost"
                size="icon-xs"
                onPointerDown={(event) => event.stopPropagation()}
                className="bg-panel text-faint hover:text-negative"
                aria-label={`Excluir ${deal.title}`}
                title="Excluir"
              >
                <Trash aria-hidden />
              </Button>
            }
          />
        </div>
      ) : null}
    </li>
  );
}

/** The copy that rides under the cursor inside `<DragOverlay>`. */
export function DealCardPreview({ deal }: { deal: DealCardData }) {
  return (
    <DealCardBody
      deal={deal}
      interactive={false}
      // The overlay wrapper is already sized to the card that was picked up, so
      // the copy only has to fill it.
      className="w-full rotate-1 cursor-grabbing border-brand/30 shadow-lg shadow-black/40"
    />
  );
}
