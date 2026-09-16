"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

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
 * The Kanban board — PLAN.md M7, the hero screen of the product.
 *
 * The drag is local state and nothing else: dropping a card rearranges the
 * board in memory and a reload puts everything back. M13 turns `onDragEnd` into
 * a Server Action call — the optimistic update is already this `setBoard`, and
 * the rollback is keeping the previous board around to restore if the action
 * rejects. `moveDealInBoard()` hands back the `position` that action will write,
 * so no arithmetic has to be repeated on the server.
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
  // Seeded once from the server data. Until M13 there is nothing to sync back
  // to, so the board owns its order for the life of the page.
  const [board, setBoard] = useState<PipelineBoard>(() =>
    groupDealsByStage(deals),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // Without a small threshold the pointer sensor swallows plain clicks, and a
    // card that cannot be clicked cannot grow a detail view later.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeDeal = activeId ? findDeal(board, activeId) : null;

  /**
   * dnd-kit announces in English out of the box. The application speaks PT-BR,
   * and a screen reader user is exactly the person who depends on these strings
   * being right (CLAUDE.md §6).
   */
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
    setActiveId(String(event.active.id));
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

    setBoard((current) => {
      const to = columnOf(current, overId);
      if (!to) return current;

      const overIndex = current[to].findIndex((deal) => deal.id === overId);
      const index = overIndex >= 0 ? overIndex : current[to].length;

      // M13: the `position` returned here is what the Server Action persists.
      return moveDealInBoard(current, activeCardId, to, index).board;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements }}
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
      <div className="board-wash -mx-6 min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-6">
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
          <div className="mx-2 w-px shrink-0 self-stretch bg-border/60" aria-hidden />

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
