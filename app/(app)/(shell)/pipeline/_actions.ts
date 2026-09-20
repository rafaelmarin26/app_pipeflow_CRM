"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isClosedStage } from "@/lib/labels";
import { translateDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { dealInputToRow, dealSchema, type DealInput } from "@/lib/validations/deal";
import { requireWorkspaceContext } from "@/lib/workspace";
import type { DealStage } from "@/types/database";

/**
 * The Kanban board, persisted for real — PLAN.md M13.
 *
 * Same shape as `leads/_actions.ts`: authenticate and resolve the active
 * workspace, validate, execute. Any workspace member may create, edit, move
 * or delete a deal — RLS on `deals` (`20260919120500_create_deals.sql`)
 * grants the same thing, so there is no separate role check to add here.
 */

async function requireContextOrRedirect() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  return { supabase, ...context };
}

export async function createDeal(
  values: DealInput,
): Promise<{ error: string } | { id: string }> {
  const parsed = dealSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique os campos e tente novamente." };
  }

  const { supabase, workspace } = await requireContextOrRedirect();
  const row = dealInputToRow(parsed.data);

  const { data, error } = await supabase
    .from("deals")
    .insert({
      ...row,
      workspace_id: workspace.id,
      // A brand new deal created straight into a closed column (rare, but the
      // dialog allows picking any stage) has to carry a closed_at from the
      // start — the same rule `moveDeal` applies when a drag crosses into one.
      closed_at: isClosedStage(row.stage) ? new Date().toISOString() : null,
      // Fresh deals land at the end of their column; halving against "no
      // neighbour after" is the same arithmetic `lib/pipeline.ts` runs on the
      // client, kept here so a deal created outside the board still sorts in.
      position: Date.now(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: translateDatabaseError(error!) };
  }

  revalidatePath("/pipeline");
  return { id: data.id };
}

export async function updateDeal(
  id: string,
  values: DealInput,
): Promise<{ error: string } | void> {
  const parsed = dealSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique os campos e tente novamente." };
  }

  const { supabase, workspace } = await requireContextOrRedirect();
  const row = dealInputToRow(parsed.data);

  const { data: current, error: fetchError } = await supabase
    .from("deals")
    .select("stage, closed_at")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .single();

  if (fetchError || !current) {
    return { error: "Negócio não encontrado." };
  }

  const closed_at = closedAtFor(current.stage, current.closed_at, row.stage);

  const { error } = await supabase
    .from("deals")
    .update({ ...row, closed_at })
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/pipeline");
}

export async function deleteDeal(id: string): Promise<{ error: string } | void> {
  const { supabase, workspace } = await requireContextOrRedirect();

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/pipeline");
}

/**
 * `closed_at` follows the stage, not the update: entering `won`/`lost` from
 * an open stage stamps it, leaving either clears it. A move between the two
 * closed stages (won -> lost) keeps whatever was already there — the deal
 * closed once, and swapping the verdict does not reopen the question of when.
 */
function closedAtFor(
  fromStage: DealStage,
  currentClosedAt: string | null,
  toStage: DealStage,
): string | null {
  if (fromStage === toStage) return currentClosedAt;
  if (!isClosedStage(toStage)) return null;
  return isClosedStage(fromStage) ? currentClosedAt : new Date().toISOString();
}

/**
 * Same rule as `closedAtFor`, but for the drag's hot path: no read before the
 * write. `fromStage` comes from the client's own board state (captured at
 * the start of the drag, before any optimistic update), and when the stage's
 * open/closed side does not change, `closed_at` is simply left out of the
 * patch — the column already has whatever value it had.
 */
function closedAtPatch(
  fromStage: DealStage,
  toStage: DealStage,
): { closed_at?: string | null } {
  if (isClosedStage(fromStage) === isClosedStage(toStage)) return {};
  return { closed_at: isClosedStage(toStage) ? new Date().toISOString() : null };
}

/**
 * Moves a card to a new stage and position — the drag persistence M7 left
 * for this milestone.
 */
export async function moveDeal(
  id: string,
  fromStage: DealStage,
  toStage: DealStage,
  position: number,
): Promise<{ error: string } | void> {
  const { supabase, workspace } = await requireContextOrRedirect();

  const { error } = await supabase
    .from("deals")
    .update({ stage: toStage, position, ...closedAtPatch(fromStage, toStage) })
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/pipeline");
}
