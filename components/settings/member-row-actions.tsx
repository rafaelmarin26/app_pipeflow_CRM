"use client";

import { LeaveWorkspaceButton } from "@/components/settings/leave-workspace-button";
import { RemoveMemberDialog } from "@/components/settings/remove-member-dialog";

/** What one roster row can do, decided by whose row it is and who is looking. */
export function MemberRowActions({
  userId,
  name,
  currentUserId,
  isAdmin,
  workspaceName,
}: {
  userId: string;
  name: string;
  currentUserId: string;
  isAdmin: boolean;
  workspaceName: string;
}) {
  const isSelf = userId === currentUserId;

  if (isSelf) {
    return <LeaveWorkspaceButton workspaceName={workspaceName} />;
  }

  if (isAdmin) {
    return <RemoveMemberDialog userId={userId} name={name} />;
  }

  return null;
}
