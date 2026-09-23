import { InviteDialog } from "@/components/settings/invite-dialog";
import { MemberRoleSelect } from "@/components/settings/member-role-select";
import { MemberRowActions } from "@/components/settings/member-row-actions";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { formatDate, initials } from "@/lib/utils";
import type { MemberWithProfile } from "@/types/views";

/**
 * Workspace roster — PLAN.md M9/M15. Everyone can see the table (the RLS
 * policy already allows any member to read the roster); only an Admin gets
 * the invite button, the role picker and the remove action, per CLAUDE.md
 * §7's "escondido na UI e checado no servidor" and this milestone's server
 * guards in `settings/_actions.ts`.
 */
export function MembersTable({
  members,
  currentUserId,
  isAdmin,
  workspaceName,
}: {
  members: MemberWithProfile[];
  currentUserId: string;
  isAdmin: boolean;
  workspaceName: string;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Membros"
        description={`${members.length} ${members.length === 1 ? "pessoa" : "pessoas"} com acesso a este workspace.`}
        action={isAdmin ? <InviteDialog /> : undefined}
      />

      <div className="overflow-hidden rounded-lg border border-hairline bg-panel">
        <Table>
          <TableHeader>
            <TableRow className="border-hairline hover:bg-transparent">
              <TableHead className="label-mono text-faint">Pessoa</TableHead>
              <TableHead className="label-mono text-faint">Papel</TableHead>
              <TableHead className="label-mono hidden text-faint sm:table-cell">
                Entrou em
              </TableHead>
              <TableHead className="label-mono w-[88px] text-right text-faint">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isSelf = member.user_id === currentUserId;
              const canEditRole = isAdmin && !isSelf;

              return (
                <TableRow key={member.user_id} className="h-11 border-hairline hover:bg-elevated">
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7 shrink-0">
                        {member.profile.avatar_url ? (
                          <AvatarImage src={member.profile.avatar_url} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-elevated font-mono text-[10px] text-muted-foreground">
                          {initials(member.profile.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">
                          {member.profile.name}
                          {isSelf ? " (você)" : ""}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {member.profile.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    {canEditRole ? (
                      <MemberRoleSelect userId={member.user_id} role={member.role} />
                    ) : (
                      <Badge variant="secondary">{MEMBER_ROLE_LABELS[member.role]}</Badge>
                    )}
                  </TableCell>

                  <TableCell className="hidden py-2 text-sm text-muted-foreground sm:table-cell">
                    {formatDate(member.created_at)}
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex justify-end">
                      <MemberRowActions
                        userId={member.user_id}
                        name={member.profile.name}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        workspaceName={workspaceName}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
