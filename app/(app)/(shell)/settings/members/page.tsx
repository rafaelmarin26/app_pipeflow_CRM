import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LimitNotice } from "@/components/shared/limit-notice";
import { MembersTable } from "@/components/settings/members-table";
import { PendingInvites } from "@/components/settings/pending-invites";
import { canAddMember } from "@/lib/limits";
import { createClient } from "@/lib/supabase/server";
import { requireWorkspaceContext } from "@/lib/workspace";
import type { InviteWithInviter, MemberWithProfile, Person } from "@/types/views";

export const metadata: Metadata = { title: "Membros" };

/**
 * Roster and pending invites — PLAN.md M9/M15. Every member can see this
 * page; the pending-invites query and the Admin-only controls inside
 * `MembersTable`/`PendingInvites` are what actually gate the page by role.
 */
export default async function MembersSettingsPage() {
  const supabase = await createClient();
  const context = await requireWorkspaceContext(supabase);
  if (!context) redirect("/login");

  const { workspace, role, user } = context;
  const isAdmin = role === "admin";

  const [{ data: roster }, { data: invites }, memberLimit] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("user_id, role, created_at, profile:profiles(id, name, email, avatar_url)")
      .eq("workspace_id", workspace.id)
      .order("created_at", { ascending: true }),
    isAdmin
      ? supabase
          .from("invites")
          .select("*, inviter:invited_by(id, name, email, avatar_url)")
          .eq("workspace_id", workspace.id)
          .is("accepted_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
    // Only an Admin can invite, so only an Admin needs to hear the seats ran out.
    isAdmin ? canAddMember(supabase, workspace) : Promise.resolve(null),
  ]);

  const members: MemberWithProfile[] = (roster ?? [])
    .filter((row): row is typeof row & { profile: Person } => row.profile !== null)
    .map((row) => ({
      user_id: row.user_id,
      role: row.role,
      created_at: row.created_at,
      profile: row.profile,
    }));

  return (
    <div className="space-y-6">
      {memberLimit && memberLimit.limit !== null && !memberLimit.allowed ? (
        <LimitNotice resource="colaboradores" limit={memberLimit.limit} isAdmin />
      ) : null}

      <MembersTable
        members={members}
        currentUserId={user.id}
        isAdmin={isAdmin}
        workspaceName={workspace.name}
      />

      {isAdmin ? <PendingInvites invites={(invites ?? []) as InviteWithInviter[]} /> : null}
    </div>
  );
}
