import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";

import { DEAL_STAGES, isClosedStage } from "@/lib/labels";
import type { DealStage } from "@/types/database";
import type { DealCardData } from "@/types/views";

/**
 * Board logic — PLAN.md M7, with the M13 handoff already in mind.
 *
 * Nothing in here knows about React, dnd-kit or the DOM: grouping, column
 * totals, the fractional rank and the due-date verdict are plain functions over
 * plain data. M13 turns the drag into a Server Action, and that action needs the
 * same arithmetic the browser just ran — `moveDealInBoard()` therefore returns
 * both the next board (for the optimistic update) and the `position` value
 * (for the `update deals set stage, position`), so the two can never disagree.
 */

export type PipelineBoard = Record<DealStage, DealCardData[]>;

/** Gap between two freshly appended cards. Matches the spacing in the fixtures. */
const POSITION_STEP = 1000;

/** How far ahead a deadline still counts as "coming up" rather than "someday". */
const SOON_WINDOW_DAYS = 7;

function emptyBoard(): PipelineBoard {
  return {
    new: [],
    contacted: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: [],
  };
}

/**
 * Deals bucketed by stage, every column present even when nothing is in it —
 * an absent key would make the board render five columns instead of six.
 * Each column is sorted by `position`, which is the order the database stores.
 */
export function groupDealsByStage(deals: DealCardData[]): PipelineBoard {
  const board = emptyBoard();

  for (const deal of deals) {
    board[deal.stage].push(deal);
  }

  for (const stage of DEAL_STAGES) {
    board[stage].sort((a, b) => a.position - b.position);
  }

  return board;
}

/** Count and summed value of one column, for the header. */
export function columnSummary(deals: DealCardData[]): {
  count: number;
  totalCents: number;
} {
  return {
    count: deals.length,
    totalCents: deals.reduce((sum, deal) => sum + deal.value_cents, 0),
  };
}

/**
 * Fractional rank for a card dropped between two neighbours.
 *
 * Halving the gap instead of renumbering the column is what lets M13 persist a
 * move with a single-row update: only the card that moved is written, and the
 * cards around it keep the positions they already had (CLAUDE.md §4).
 */
export function positionBetween(
  before: number | null,
  after: number | null,
): number {
  if (before === null && after === null) return POSITION_STEP;
  if (before === null) return (after as number) / 2;
  if (after === null) return before + POSITION_STEP;
  return (before + after) / 2;
}

export type DueState = "overdue" | "soon" | "none";

/**
 * How urgent a deal's deadline is, compared by calendar day rather than by
 * timestamp — "vence hoje" has to stay "hoje" all day, not flip to overdue at
 * lunchtime.
 *
 * A closed deal has no deadline worth flagging: once it is won or lost the date
 * is history, and painting it amber would be noise on the two columns that are
 * already carrying their own colour.
 */
export function dueState(dueDate: string | null, stage: DealStage): DueState {
  if (!dueDate || isClosedStage(stage)) return "none";

  const date = parseISO(dueDate);
  if (Number.isNaN(date.getTime())) return "none";

  const days = differenceInCalendarDays(date, startOfDay(new Date()));

  if (days < 0) return "overdue";
  if (days <= SOON_WINDOW_DAYS) return "soon";
  return "none";
}

/**
 * Moves a card to `toIndex` of `toStage` and hands back everything the caller
 * needs: the next board to render and the `position` to store.
 *
 * `toIndex` is read against the column as it stands *before* the card is pulled
 * out, which is how a sortable list reports the slot under the pointer.
 */
export function moveDealInBoard(
  board: PipelineBoard,
  dealId: string,
  toStage: DealStage,
  toIndex: number,
): { board: PipelineBoard; position: number } {
  const next = emptyBoard();
  let moving: DealCardData | undefined;

  for (const stage of DEAL_STAGES) {
    for (const deal of board[stage]) {
      if (deal.id === dealId) {
        moving = deal;
      } else {
        next[stage].push(deal);
      }
    }
  }

  // An id that is not on the board means there is nothing to move and nothing
  // to persist; handing back the original board keeps the caller a no-op.
  if (!moving) return { board, position: 0 };

  const column = next[toStage];
  const index = Math.max(0, Math.min(toIndex, column.length));

  const before = index > 0 ? column[index - 1].position : null;
  const after = index < column.length ? column[index].position : null;
  const position = positionBetween(before, after);

  column.splice(index, 0, { ...moving, stage: toStage, position });

  return { board: next, position };
}
