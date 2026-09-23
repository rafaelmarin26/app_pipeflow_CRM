"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { translateDatabaseError } from "@/lib/supabase/errors";
import { setActiveWorkspaceCookie } from "@/lib/workspace";

const POSTGRES_UNIQUE_VIOLATION = "23505";

/**
 * Accepts an invite — PLAN.md M15. Runs through the service role client
 * (CLAUDE.md §5) because the visitor is, by definition, not yet a
 * `workspace_members` row: no RLS policy on `invites` or `workspace_members`
 * would let a plain client see the invite or insert the membership.
 *
 * Re-reads the invite fresh here rather than trusting whatever the page
 * rendered — the token could have expired, been accepted from another tab,
 * or been cancelled by the Admin in the time it took to click the button.
 */
export async function acceptInvite(token: string): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const service = createServiceRoleClient();

  const { data: invite } = await service
    .from("invites")
    .select("id, workspace_id, email, role, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { error: "Convite não encontrado." };
  if (invite.accepted_at) return { error: "Este convite já foi aceito." };
  if (new Date(invite.expires_at) < new Date()) {
    return { error: "Este convite expirou. Peça um novo à pessoa que te convidou." };
  }
  if (invite.email.toLowerCase() !== (user.email ?? "").toLowerCase()) {
    return {
      error: `Este convite foi enviado para ${invite.email}. Entre com essa conta para aceitar.`,
    };
  }

  const { error: membershipError } = await service
    .from("workspace_members")
    .insert({ workspace_id: invite.workspace_id, user_id: user.id, role: invite.role });

  // Accepting twice from two tabs is a race, not a failure — the membership
  // already exists, so the invite still gets marked accepted below.
  if (membershipError && membershipError.code !== POSTGRES_UNIQUE_VIOLATION) {
    return { error: translateDatabaseError(membershipError) };
  }

  await service
    .from("invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  await setActiveWorkspaceCookie(invite.workspace_id);
  redirect("/dashboard");
}
