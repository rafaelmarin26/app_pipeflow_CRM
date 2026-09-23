import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteRowActions } from "@/components/settings/invite-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import type { InviteWithInviter } from "@/types/views";

/** Convites ainda não aceitos — PLAN.md M15, visível só para Admin. */
export function PendingInvites({ invites }: { invites: InviteWithInviter[] }) {
  if (invites.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Convites pendentes</CardTitle>
        <CardDescription>
          Ainda não aceitos. Reenvie se a pessoa não recebeu o e-mail, ou cancele.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="border-hairline hover:bg-transparent">
              <TableHead className="label-mono text-faint">E-mail</TableHead>
              <TableHead className="label-mono text-faint">Papel</TableHead>
              <TableHead className="label-mono hidden text-faint sm:table-cell">
                Enviado por
              </TableHead>
              <TableHead className="label-mono hidden text-faint sm:table-cell">
                Expira em
              </TableHead>
              <TableHead className="label-mono w-[88px] text-right text-faint">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.id} className="h-11 border-hairline hover:bg-elevated">
                <TableCell className="py-2 text-sm text-foreground">{invite.email}</TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {MEMBER_ROLE_LABELS[invite.role]}
                </TableCell>
                <TableCell className="hidden py-2 text-sm text-muted-foreground sm:table-cell">
                  {invite.inviter?.name ?? "—"}
                </TableCell>
                <TableCell className="hidden py-2 text-sm text-muted-foreground sm:table-cell">
                  {formatDate(invite.expires_at)}
                </TableCell>
                <TableCell className="py-2">
                  <InviteRowActions id={invite.id} email={invite.email} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
