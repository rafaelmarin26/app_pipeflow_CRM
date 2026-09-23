"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";
import { createWorkspaceWithOwner, setActiveWorkspaceCookie } from "@/lib/workspace";

/**
 * Creates the first workspace and its founding admin membership for real —
 * PLAN.md M11. Runs through `create_workspace_with_owner()` (added in M10)
 * via the shared `createWorkspaceWithOwner()` helper (M15 factors the
 * slug-retry loop out of here, reused by "criar outro workspace" in the
 * switcher).
 *
 * Follows CLAUDE.md §3's order (authenticate → validate → execute) minus the
 * "resolver workspace ativo" and permission-check steps: this action is what
 * creates the workspace, and any authenticated user may create one of their own.
 */
export async function createWorkspace(
  values: WorkspaceInput,
): Promise<{ error: string } | void> {
  const parsed = workspaceSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dê um nome ao seu workspace." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await createWorkspaceWithOwner(supabase, parsed.data.name);
  if ("error" in result) return result;

  await setActiveWorkspaceCookie(result.workspace.id);
  redirect("/dashboard");
}
