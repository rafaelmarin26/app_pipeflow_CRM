"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";
import { setActiveWorkspaceCookie } from "@/lib/workspace";

const POSTGRES_UNIQUE_VIOLATION = "23505";
const MAX_SLUG_ATTEMPTS = 5;

/**
 * Creates the first workspace and its founding admin membership for real —
 * PLAN.md M11. Runs through `create_workspace_with_owner()` (added in M10):
 * the workspace_members insert policy requires the caller to already be a
 * member, so that founding row can only ever come from this security-definer
 * function, never from a plain client insert.
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

  const baseSlug = slugify(parsed.data.name) || "workspace";

  // The slug is derived from the name and the column is unique, so two
  // workspaces named the same thing (two different signups both typing
  // "Agência Norte") need a fallback rather than a raw constraint error.
  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const { data: workspace, error } = await supabase.rpc("create_workspace_with_owner", {
      workspace_name: parsed.data.name,
      workspace_slug: slug,
    });

    if (!error && workspace) {
      await setActiveWorkspaceCookie(workspace.id);
      redirect("/dashboard");
    }

    if (error && error.code !== POSTGRES_UNIQUE_VIOLATION) {
      return { error: "Não foi possível criar o workspace. Tente novamente." };
    }
  }

  return { error: "Já existe um workspace com um endereço parecido. Tente outro nome." };
}
