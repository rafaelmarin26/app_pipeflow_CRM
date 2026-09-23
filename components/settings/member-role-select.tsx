"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { updateMemberRole } from "@/app/(app)/(shell)/settings/_actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import type { MemberRole } from "@/types/database";

/** Promote or demote one member — PLAN.md M15, Admin only (the caller checks). */
export function MemberRoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: MemberRole;
}) {
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    if (next === role) return;

    startTransition(async () => {
      const result = await updateMemberRole(userId, next as MemberRole);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Papel atualizado.");
    });
  }

  return (
    <Select value={role} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-32" aria-label="Papel">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(MEMBER_ROLE_LABELS) as MemberRole[]).map((value) => (
          <SelectItem key={value} value={value}>
            {MEMBER_ROLE_LABELS[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
