"use client";

import { useEffect, useRef, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type ScreenReaderInstructions,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { moveDeal } from "@/app/(app)/(shell)/pipeline/_actions";
import { DealCardPreview } from "@/components/pipeline/deal-card";
import { KanbanColumn } from "@/components/pipeline/kanban-column";
import { DEAL_STAGE_LABELS, DEAL_STAGES, isClosedStage } from "@/lib/labels";
import {
  groupDealsByStage,
  moveDealInBoard,
  type PipelineBoard,
} from "@/lib/pipeline";
import type { DealStage, Lead } from "@/types/database";
import type { DealCardData, Person } from "@/types/views";

/**
 * The Kanban board — PLAN.md M7, the hero screen of the product, with M13's
 * drag persistence in place.
 *
 * `setBoard` on drop is still the whole optimistic update: the UI moves the
 * instant the pointer releases, before the network call resolves. What M13
 * adds is `moveDeal()` running after it — queued through `moveQueueRef` so
 * two quick drags of the same card reach the server in the order they
 * happened, and rolled back to `dragStartBoardRef`'s snapshot with a toast if
 * the action rejects. `moveDealInBoard()` still hands back the `position`
 * the action writes, so the rank arithmetic is never repeated server-side.
 */

/** The funnel proper. Rendered together, before the divider. */
const OPEN_STAGES = DEAL_STAGES.filter((stage) => !isClosedStage(stage));

/** The two outcomes, set apart so the board reads "funil | desfecho". */
const CLOSED_STAGES = DEAL_STAGES.filter(isClosedStage);

function isStage(id: string): id is DealStage {
  return (DEAL_STAGES as readonly string[]).includes(id);
}

/** Which column an id belongs to — the id is either a stage or a card. */
function columnOf(board: PipelineBoard, id: string): DealStage | null {
  if (isStage(id)) return id;
  return DEAL_STAGES.find((stage) => board[stage].some((d) => d.id === id)) ?? null;
}

function findDeal(board: PipelineBoard, id: string): DealCardData | null {
  for (const stage of DEAL_STAGES) {
    const deal = board[stage].find((d) => d.id === id);
    if (deal) return deal;
  }
  return null;
}

export function PipelineBoardView({
  deals,
  leads,
  owners,
  defaultOwnerId,
}: {
  deals: DealCardData[];
  /** Options for the "new deal" dialog each column header carries. */
  leads: Pick<Lead, "id" | "name">[];
  owners: Person[];
  defaultOwnerId?: string;
}) {
  // Seeded from the server data, then kept in sync with it: `deals` gets a
  // new array every time the page revalidates after a mutation (drag aside,
  // which patches `board` itself — creating, editing or deleting a deal all
  // go through a dialog that has no reference to this state at all). Without
  // this effect, `useState`'s initializer would only ever run once, and a
  // deal created through the dialog would need a manual reload to appear on
  // the board it was just added to.
  const [board, setBoard] = useState<PipelineBoard>(() =>
    groupDealsByStage(deals),
  );

  useEffect(() => {
    setBoard(groupDealsByStage(deals));
  }, [deals]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // The board and the deal's stage as they were the instant the drag began —
  // not derived from `board` inside the handlers below, which by
  // `handleDragEnd` already reflects every column the card crossed while
  // hovering. Rollback needs the *original* board, and `closed_at` needs the
  // *original* stage.
  const dragStartBoardRef = useRef<PipelineBoard | null>(null);
  const dragStartStageRef = useRef<DealStage | null>(null);

  // Serializes the Server Action calls: two drags fired in quick succession
  // (of the same card, or of two different ones) reach the server in the
  // order the user made them, so the last request in never loses to a
  // slower one still in flight.
  const moveQueueRef = useRef<Promise<void>>(Promise.resolve());

  function queueMove(run: () => Promise<void>) {
    moveQueueRef.current = moveQueueRef.current.then(run, run);
  }

  const sensors = useSensors(
    // Without a small threshold the pointer sensor swallows plain clicks, and a
    // card that cannot be clicked cannot grow a detail view later.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeDeal = activeId ? findDeal(board, activeId) : null;

  /**
   * dnd-kit ships every accessibility string in English. The application speaks
   * PT-BR, and a screen reader user is exactly the person who depends on these
   * being right (CLAUDE.md §6) — they are the whole interface for someone who
   * cannot see the card move.
   *
   * These are the instructions read when a card first takes focus, before any
   * drag has started.
   */
  const screenReaderInstructions: ScreenReaderInstructions = {
    draggable: `
      Para pegar um negócio, pressione a barra de espaço.
      Durante o arraste, use as setas para mover entre as etapas e as posições.
      Pressione a barra de espaço novamente para soltar, ou Esc para cancelar.
    `,
  };

  function describeTarget(overId: string | null): string | null {
    if (!overId) return null;
    const stage = columnOf(board, overId);
    return stage ? DEAL_STAGE_LABELS[stage] : null;
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      const deal = findDeal(board, String(active.id));
      if (!deal) return;
      return `Negócio ${deal.title} selecionado. Use as setas para mover entre as etapas e a barra de espaço para soltar.`;
    },
    onDragOver({ active, over }) {
      const deal = findDeal(board, String(active.id));
      const target = describeTarget(over ? String(over.id) : null);
      if (!deal || !target) return;
      return `Negócio ${deal.title} sobre a etapa ${target}.`;
    },
    onDragEnd({ active, over }) {
      const deal = findDeal(board, String(active.id));
      if (!deal) return;
      const target = describeTarget(over ? String(over.id) : null);
      return target
        ? `Negócio ${deal.title} movido para a etapa ${target}.`
        : `Negócio ${deal.title} voltou para a posição original.`;
    },
    onDragCancel({ active }) {
      const deal = findDeal(board, String(active.id));
      return deal
        ? `Movimentação cancelada. Negócio ${deal.title} voltou para a posição original.`
        : undefined;
    },
  };

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setActiveId(id);
    dragStartBoardRef.current = board;
    dragStartStageRef.current = findDeal(board, id)?.stage ?? null;
  }

  /**
   * Moves the card across columns while it is still in the air, so the column it
   * is about to land in grows a slot for it instead of accepting it blind.
   */
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = String(active.id);
    const overId = String(over.id);

    setBoard((current) => {
      const from = columnOf(current, activeCardId);
      const to = columnOf(current, overId);
      if (!from || !to || from === to) return current;

      const overIndex = current[to].findIndex((deal) => deal.id === overId);
      const index = overIndex >= 0 ? overIndex : current[to].length;

      return moveDealInBoard(current, activeCardId, to, index).board;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCardId = String(active.id);
    const overId = String(over.id);
    const fromStage = dragStartStageRef.current;
    const boardBeforeDrag = dragStartBoardRef.current;

    setBoard((current) => {
      const to = columnOf(current, overId);
      if (!to || !fromStage) return current;

      const overIndex = current[to].findIndex((deal) => deal.id === overId);
      const index = overIndex >= 0 ? overIndex : current[to].length;

      const { board: next, position } = moveDealInBoard(
        current,
        activeCardId,
        to,
        index,
      );

      // The id was not on the board (drag of something already gone) —
      // nothing moved, so there is nothing to persist either.
      if (next === current) return current;

      queueMove(async () => {
        const result = await moveDeal(activeCardId, fromStage, to, position);

        if (result && "error" in result) {
          toast.error(result.error);
          if (boardBeforeDrag) setBoard(boardBeforeDrag);
        }
      });

      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      {/* The shell gives `main` a p-6; the board bleeds back to the viewport
          edges so the horizontal scroll runs the full width and no column is
          cut off by the page padding.

          Height comes from the flex column the page builds, never from a
          calc() of the chrome above it: the columns take whatever is left, so
          growing the topbar or the page header cannot leave the board hanging
          off the bottom. Vertical overflow is clipped because each column does
          its own scrolling — the only scrollbar here is the horizontal one. */}
      <div className="-mx-6 min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-6">
        <div className="flex h-full min-h-[24rem] items-stretch gap-4">
          {OPEN_STAGES.map((stage, index) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              index={index}
              deals={board[stage]}
              activeDealId={activeId}
              leads={leads}
              owners={owners}
              defaultOwnerId={defaultOwnerId}
            />
          ))}

          {/* Funnel on the left, outcomes on the right. */}
          <div className="mx-2 w-px shrink-0 self-stretch bg-hairline" aria-hidden />

          {CLOSED_STAGES.map((stage, index) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              index={OPEN_STAGES.length + index}
              deals={board[stage]}
              activeDealId={activeId}
              leads={leads}
              owners={owners}
              defaultOwnerId={defaultOwnerId}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeDeal ? <DealCardPreview deal={activeDeal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
