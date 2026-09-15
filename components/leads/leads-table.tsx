import Link from "next/link";

import { LeadRowActions } from "@/components/leads/lead-row-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, initials } from "@/lib/utils";
import type { LeadWithOwner, Person } from "@/types/views";

/**
 * The leads list — PLAN.md M6.
 *
 * A Server Component: it only renders rows it was handed. The two interactive
 * bits (row actions, and the toolbar above it) are the client leaves, which is
 * what keeps the table itself out of the browser bundle (CLAUDE.md §3).
 *
 * Below `md` the secondary columns collapse into the first cell rather than
 * scrolling sideways — a lead is identified by name and company, and those two
 * have to survive on a 360px screen.
 */
export function LeadsTable({
  leads,
  owners,
}: {
  leads: LeadWithOwner[];
  owners: Person[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-panel">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs tracking-wide uppercase">
              Lead
            </TableHead>
            <TableHead className="hidden text-xs tracking-wide uppercase md:table-cell">
              Empresa
            </TableHead>
            <TableHead className="text-xs tracking-wide uppercase">
              Status
            </TableHead>
            <TableHead className="hidden text-xs tracking-wide uppercase lg:table-cell">
              Responsável
            </TableHead>
            <TableHead className="hidden text-xs tracking-wide uppercase sm:table-cell">
              Criado em
            </TableHead>
            <TableHead className="w-[88px] text-right text-xs tracking-wide uppercase">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="h-11">
              <TableCell className="py-2">
                <Link
                  href={`/leads/${lead.id}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {lead.name}
                </Link>

                <div className="text-xs text-muted-foreground md:hidden">
                  {lead.company ?? "Sem empresa"}
                </div>
                <div className="hidden text-xs text-muted-foreground md:block">
                  {lead.email ?? "Sem e-mail"}
                </div>
              </TableCell>

              <TableCell className="hidden py-2 md:table-cell">
                <div className="text-sm text-foreground">
                  {lead.company ?? "—"}
                </div>
                {lead.job_title ? (
                  <div className="text-xs text-muted-foreground">
                    {lead.job_title}
                  </div>
                ) : null}
              </TableCell>

              <TableCell className="py-2">
                <StatusBadge status={lead.status} />
              </TableCell>

              <TableCell className="hidden py-2 lg:table-cell">
                {lead.owner ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 shrink-0">
                      {lead.owner.avatar_url ? (
                        <AvatarImage src={lead.owner.avatar_url} alt="" />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {initials(lead.owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {lead.owner.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sem responsável
                  </span>
                )}
              </TableCell>

              <TableCell className="hidden py-2 text-sm text-muted-foreground tabular-nums sm:table-cell">
                {formatDate(lead.created_at)}
              </TableCell>

              <TableCell className="py-2">
                <LeadRowActions lead={lead} owners={owners} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
