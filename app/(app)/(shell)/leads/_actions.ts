"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { canAddLead } from "@/lib/limits";
import { createClient } from "@/lib/supabase/server";
import { translateDatabaseError } from "@/lib/supabase/errors";
import {
  activitySchema,
  type ActivityInput,
} from "@/lib/validations/activity";
import { leadInputToRow, leadSchema, type LeadInput } from "@/lib/validations/lead";
import { requireWorkspaceContext } from "@/lib/workspace";

/**
 * Leads and activities, persisted for real — PLAN.md M12.
 *
 * Every action opens with CLAUDE.md §3's order: authenticate and resolve the
 * active workspace (`requireWorkspaceContext`), validate with the same zod
 * schema the dialog already runs client-side, then execute. There is no
 * separate permission check between validating and executing: any workspace
 * member may create, edit or delete a lead and log an activity (the "Membro
 * opera leads e negócios" persona in the PRD), so membership — already
 * proven by having an active workspace — *is* the permission check. RLS
 * enforces the same rule again at the database, so a bug here can narrow
 * access but never widen it past what the policies in
 * `20260919120400_create_leads.sql` allow.
 */

async function requireContextOrRedirect() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");
  return { supabase, ...context };
}

export async function createLead(
  values: LeadInput,
): Promise<{ error: string } | { id: string }> {
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique os campos e tente novamente." };
  }

  const { supabase, workspace } = await requireContextOrRedirect();

  // The Free ceiling (CLAUDE.md §5) is checked here, before the insert, so the
  // UI can never be the only thing standing between a workspace and lead 51.
  const limit = await canAddLead(supabase, workspace);
  if (!limit.allowed) return { error: limit.message! };

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...leadInputToRow(parsed.data), workspace_id: workspace.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: translateDatabaseError(error!) };
  }

  revalidatePath("/leads");
  return { id: data.id };
}

export async function updateLead(
  id: string,
  values: LeadInput,
): Promise<{ error: string } | void> {
  const parsed = leadSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique os campos e tente novamente." };
  }

  const { supabase, workspace } = await requireContextOrRedirect();

  const { error } = await supabase
    .from("leads")
    .update(leadInputToRow(parsed.data))
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string): Promise<{ error: string } | void> {
  const { supabase, workspace } = await requireContextOrRedirect();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/leads");
}

export async function createActivity(
  leadId: string,
  values: ActivityInput,
): Promise<{ error: string } | void> {
  const parsed = activitySchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique os campos e tente novamente." };
  }

  const { supabase, workspace, user } = await requireContextOrRedirect();

  // `author_id` comes from the authenticated user, never from the form — the
  // insert policy on activities checks the same equality
  // (`author_id = (select auth.uid())`), so a mismatch here would just be
  // rejected, not spoofed.
  const { error } = await supabase.from("activities").insert({
    workspace_id: workspace.id,
    lead_id: leadId,
    author_id: user.id,
    type: parsed.data.type,
    description: parsed.data.description,
  });

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath(`/leads/${leadId}`);
}
