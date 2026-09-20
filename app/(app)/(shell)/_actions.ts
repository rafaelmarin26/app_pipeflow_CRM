"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getUserMemberships, setActiveWorkspaceCookie } from "@/lib/workspace";

/** Ends the session and sends the user back to the login screen — PLAN.md M11. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Moves the active-workspace cookie without navigating away — PLAN.md M11's
 * "workspace switcher com dados reais". The switcher can be opened from any
 * page in the shell, and a hard redirect to /dashboard would throw away
 * whatever the user was looking at; the caller just calls `router.refresh()`
 * afterwards so the current page re-renders under the new workspace.
 */
export async function switchWorkspace(
  workspaceId: string,
): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getUserMemberships(supabase, user.id);
  const isMember = memberships.some((membership) => membership.workspace.id === workspaceId);

  if (!isMember) {
    return { error: "Você não faz parte deste workspace." };
  }

  await setActiveWorkspaceCookie(workspaceId);
}
