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
 * Below `lg` the Empresa/Responsável columns collapse into the first cell
 * rather than scrolling sideways — a lead is identified by name and company,
 * and those two have to survive on a 360px screen. `table-fixed` with an
 * explicit width on every column but this one keeps that promise past 360px
 * too: at exactly 768px there is only enough room for one flexible column
 * plus Status/Criado em/Ações, which is why Empresa waits for `lg` instead of
 * joining at `md` the way it first shipped in M6.
 */
export function LeadsTable({
  leads,
  owners,
}: {
  leads: LeadWithOwner[];
  owners: Person[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-panel">
      {/* `table-fixed`, same reasoning as the settings tables: `StatusBadge`
          is `whitespace-nowrap` by design (CLAUDE.md §7's label-mono voice),
          so without a bounded column an auto-layout table just grows past
          the card instead of leaving the badge on one line inside it. */}
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="border-hairline hover:bg-transparent">
            <TableHead className="label-mono text-faint">
              Lead
            </TableHead>
            <TableHead className="label-mono hidden text-faint lg:table-cell lg:w-40">
              Empresa
            </TableHead>
            <TableHead className="label-mono w-28 text-faint sm:w-32 lg:w-44">
              Status
            </TableHead>
            <TableHead className="label-mono hidden text-faint lg:table-cell lg:w-40">
              Responsável
            </TableHead>
            <TableHead className="label-mono hidden text-faint sm:table-cell sm:w-24">
              Criado em
            </TableHead>
            <TableHead className="label-mono w-[88px] text-right text-faint">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="h-11 border-hairline transition-colors hover:bg-elevated"
            >
              <TableCell className="py-2">
                <Link
                  href={`/leads/${lead.id}`}
                  className="block truncate font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {lead.name}
                </Link>

                <div className="truncate text-xs text-muted-foreground lg:hidden">
                  {lead.company ?? "Sem empresa"}
                </div>
                <div className="hidden truncate text-xs text-muted-foreground lg:block">
                  {lead.email ?? "Sem e-mail"}
                </div>
              </TableCell>

              <TableCell className="hidden py-2 lg:table-cell">
                <div className="truncate text-sm text-foreground">
                  {lead.company ?? "—"}
                </div>
                {lead.job_title ? (
                  <div className="truncate text-xs text-muted-foreground">
                    {lead.job_title}
                  </div>
                ) : null}
              </TableCell>

              <TableCell className="overflow-hidden py-2">
                {/* `max-w-full` + `truncate`: the widest label ("Desqualificado")
                    is wider than this column at 375/768px even after the
                    rebalance above, so it ellipsizes instead of bleeding into
                    the next cell — the same failure mode the column width
                    fix above exists to prevent. */}
                <StatusBadge status={lead.status} className="max-w-full truncate" />
              </TableCell>

              <TableCell className="hidden py-2 lg:table-cell">
                {lead.owner ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-6 shrink-0 rounded-md">
                      {lead.owner.avatar_url ? (
                        <AvatarImage src={lead.owner.avatar_url} alt="" />
                      ) : null}
                      <AvatarFallback className="bg-elevated font-mono text-[10px] text-muted-foreground">
                        {initials(lead.owner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm text-foreground">
                      {lead.owner.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Sem responsável
                  </span>
                )}
              </TableCell>

              <TableCell className="hidden py-2 sm:table-cell">
                <span className="money text-xs text-faint">
                  {formatDate(lead.created_at)}
                </span>
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
