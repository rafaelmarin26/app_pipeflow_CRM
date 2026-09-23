"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { sendInviteEmail } from "@/lib/email/resend";
import { isMemberLimitReached } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";
import { translateDatabaseError } from "@/lib/supabase/errors";
import { inviteSchema, type InviteInput } from "@/lib/validations/invite";
import { workspaceSchema, type WorkspaceInput } from "@/lib/validations/workspace";
import {
  getUserMemberships,
  requireWorkspaceContext,
  setActiveWorkspaceCookie,
  type WorkspaceContext,
} from "@/lib/workspace";
import type { Database, MemberRole } from "@/types/database";

type Supabase = SupabaseClient<Database>;
type AdminContext = WorkspaceContext & { supabase: Supabase };

const INVITE_TTL_DAYS = 7;

/**
 * Settings — PLAN.md M9/M15, persisted for real from the start (the backend
 * from M10-M14 already exists, so this milestone skips the mock phase the
 * earlier UI-first ones went through).
 *
 * Every mutation here follows CLAUDE.md §3's order and adds the permission
 * step the leads/pipeline actions never needed: authenticate → resolve
 * workspace → validate → **require Admin** → execute. RLS enforces the same
 * rule again at the database (`is_workspace_admin` policies from M10), so a
 * bug here can only narrow access, never widen it.
 */
async function requireAdminContext(): Promise<AdminContext | { error: string }> {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  if (context.role !== "admin") {
    return { error: "Só um Admin pode fazer isso." };
  }

  return { supabase, ...context };
}

async function countRosterAndPending(supabase: Supabase, workspaceId: string) {
  const [{ count: members }, { count: pending }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString()),
  ]);

  return (members ?? 0) + (pending ?? 0);
}

/** Workspace tab: rename — CLAUDE.md §5, Admin only, checked on the server. */
export async function updateWorkspaceName(
  values: WorkspaceInput,
): Promise<{ error: string } | void> {
  const parsed = workspaceSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Dê um nome ao seu workspace." };
  }

  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { error } = await admin.supabase
    .from("workspaces")
    .update({ name: parsed.data.name })
    .eq("id", admin.workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/settings/workspace");
}

/**
 * Workspace tab, danger zone. Every row that references this workspace is
 * `on delete cascade` (leads, deals, activities, invites, subscriptions,
 * memberships), so this one delete is the whole teardown.
 */
export async function deleteWorkspace(): Promise<{ error: string } | void> {
  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { error } = await admin.supabase
    .from("workspaces")
    .delete()
    .eq("id", admin.workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  const remaining = await getUserMemberships(admin.supabase, admin.user.id);

  if (remaining.length > 0) {
    await setActiveWorkspaceCookie(remaining[0].workspace.id);
    redirect("/dashboard");
  }

  redirect("/onboarding");
}

/**
 * Members tab: invite. The Free ceiling check is M16's on paper, but it only
 * needs a row count — no Stripe wiring — so it lands here instead of waiting.
 */
export async function inviteMember(
  values: InviteInput,
): Promise<{ error: string } | { emailSent: boolean }> {
  const parsed = inviteSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Verifique o e-mail e o papel escolhido." };
  }

  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { supabase, workspace, user } = admin;
  const email = parsed.data.email.trim().toLowerCase();

  const count = await countRosterAndPending(supabase, workspace.id);
  if (isMemberLimitReached(workspace.plan, count)) {
    return {
      error:
        "O plano Grátis permite até 2 colaboradores. Faça upgrade para o Pro para convidar mais gente.",
    };
  }

  const { data: roster } = await supabase
    .from("workspace_members")
    .select("profile:profiles(email)")
    .eq("workspace_id", workspace.id);

  const alreadyMember = roster?.some(
    (row) => row.profile?.email.toLowerCase() === email,
  );
  if (alreadyMember) {
    return { error: "Esta pessoa já faz parte do workspace." };
  }

  const { data: pendingInvite } = await supabase
    .from("invites")
    .select("id")
    .eq("workspace_id", workspace.id)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (pendingInvite) {
    return { error: "Já existe um convite pendente para este e-mail." };
  }

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { data: invite, error } = await supabase
    .from("invites")
    .insert({
      workspace_id: workspace.id,
      email,
      role: parsed.data.role,
      expires_at: expiresAt.toISOString(),
      invited_by: user.id,
    })
    .select("token")
    .single();

  if (error || !invite) {
    return { error: translateDatabaseError(error!) };
  }

  const inviterName =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email ||
    "Alguém do time";

  const emailSent = await sendInviteEmail({
    to: email,
    workspaceName: workspace.name,
    inviterName,
    role: parsed.data.role,
    token: invite.token,
  });

  revalidatePath("/settings/members");
  return { emailSent };
}

/** Members tab: bump the expiry and send the e-mail again. */
export async function resendInvite(id: string): Promise<{ error: string } | { emailSent: boolean }> {
  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { supabase, workspace, user } = admin;

  const { data: invite } = await supabase
    .from("invites")
    .select("email, role, token, accepted_at")
    .eq("id", id)
    .eq("workspace_id", workspace.id)
    .maybeSingle();

  if (!invite) return { error: "Convite não encontrado." };
  if (invite.accepted_at) return { error: "Este convite já foi aceito." };

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("invites")
    .update({ expires_at: expiresAt.toISOString() })
    .eq("id", id);

  if (error) return { error: translateDatabaseError(error) };

  const inviterName =
    (typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()) ||
    user.email ||
    "Alguém do time";

  const emailSent = await sendInviteEmail({
    to: invite.email,
    workspaceName: workspace.name,
    inviterName,
    role: invite.role,
    token: invite.token,
  });

  revalidatePath("/settings/members");
  return { emailSent };
}

/** Members tab: cancel a pending invite. */
export async function cancelInvite(id: string): Promise<{ error: string } | void> {
  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { error } = await admin.supabase
    .from("invites")
    .delete()
    .eq("id", id)
    .eq("workspace_id", admin.workspace.id);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/settings/members");
}

async function countAdmins(supabase: Supabase, workspaceId: string): Promise<number> {
  const { count } = await supabase
    .from("workspace_members")
    .select("user_id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("role", "admin");

  return count ?? 0;
}

/** Members tab: promote or demote — blocked on the last Admin demoting themselves. */
export async function updateMemberRole(
  userId: string,
  role: MemberRole,
): Promise<{ error: string } | void> {
  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { supabase, workspace } = admin;

  if (role === "member") {
    const { data: target } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspace.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (target?.role === "admin" && (await countAdmins(supabase, workspace.id)) <= 1) {
      return { error: "O workspace precisa de pelo menos um Admin." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspace.id)
    .eq("user_id", userId);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/settings/members");
}

/** Members tab: remove someone else — blocked on removing the last Admin. */
export async function removeMember(userId: string): Promise<{ error: string } | void> {
  const admin = await requireAdminContext();
  if ("error" in admin) return admin;

  const { supabase, workspace, user } = admin;

  if (userId === user.id) {
    return { error: "Use \"Sair do workspace\" para remover a si mesmo." };
  }

  const { data: target } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (target?.role === "admin" && (await countAdmins(supabase, workspace.id)) <= 1) {
    return { error: "Não é possível remover o único Admin do workspace." };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("user_id", userId);

  if (error) return { error: translateDatabaseError(error) };

  revalidatePath("/settings/members");
}

/**
 * Any member leaves their own workspace — blocked when they are the last
 * Admin, same rule as `updateMemberRole`'s self-demotion guard.
 */
export async function leaveWorkspace(): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  const { workspace, user, role } = context;

  if (role === "admin" && (await countAdmins(supabase, workspace.id)) <= 1) {
    return { error: "Você é o único Admin. Promova outra pessoa antes de sair." };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id);

  if (error) return { error: translateDatabaseError(error) };

  const remaining = await getUserMemberships(supabase, user.id);

  if (remaining.length > 0) {
    await setActiveWorkspaceCookie(remaining[0].workspace.id);
    redirect("/dashboard");
  }

  redirect("/onboarding");
}
