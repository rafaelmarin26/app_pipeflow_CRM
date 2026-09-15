import { Briefcase, Mail, Phone, Trash } from "lucide-react";

import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadDialog } from "@/components/leads/lead-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, initials } from "@/lib/utils";
import type { LeadWithOwner, Person } from "@/types/views";

/**
 * Identity card of the lead — PLAN.md M6. Everything needed to act on the
 * contact without scrolling: who they are, how to reach them, whose lead it is,
 * and the two actions that change the record.
 */
export function LeadDetailHeader({
  lead,
  owners,
}: {
  lead: LeadWithOwner;
  owners: Person[];
}) {
  const subtitle = [lead.job_title, lead.company].filter(Boolean).join(" · ");

  return (
    <div className="rounded-lg border border-border bg-panel p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {lead.name}
            </h1>
            <StatusBadge status={lead.status} />
          </div>

          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <LeadDialog
            owners={owners}
            lead={lead}
            trigger={<Button variant="outline">Editar</Button>}
          />

          <DeleteLeadDialog
            leadName={lead.name}
            redirectTo="/leads"
            trigger={
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${lead.name}`}
                title="Excluir"
                className="text-muted-foreground hover:text-lost-ink"
              >
                <Trash aria-hidden />
              </Button>
            }
          />
        </div>
      </div>

      <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
        <ContactItem icon={Mail} label="E-mail">
          {lead.email ? (
            <a
              href={`mailto:${lead.email}`}
              className="text-primary-ink underline-offset-4 hover:underline"
            >
              {lead.email}
            </a>
          ) : (
            <span className="text-muted-foreground">Não informado</span>
          )}
        </ContactItem>

        <ContactItem icon={Phone} label="Telefone">
          {lead.phone ? (
            <a
              href={`tel:${lead.phone.replace(/\D/g, "")}`}
              className="text-primary-ink tabular-nums underline-offset-4 hover:underline"
            >
              {lead.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">Não informado</span>
          )}
        </ContactItem>

        <ContactItem icon={Briefcase} label="Empresa">
          {lead.company ?? (
            <span className="text-muted-foreground">Não informada</span>
          )}
        </ContactItem>

        <div className="space-y-1.5">
          <dt className="text-xs tracking-wide text-muted-foreground uppercase">
            Responsável
          </dt>
          <dd className="flex items-center gap-2 text-sm text-foreground">
            {lead.owner ? (
              <>
                <Avatar className="size-6 shrink-0">
                  {lead.owner.avatar_url ? (
                    <AvatarImage src={lead.owner.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback className="text-[10px]">
                    {initials(lead.owner.name)}
                  </AvatarFallback>
                </Avatar>
                {lead.owner.name}
              </>
            ) : (
              <span className="text-muted-foreground">Sem responsável</span>
            )}
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-xs text-muted-foreground">
        Lead criado em {formatDate(lead.created_at)}.
      </p>
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </dt>
      <dd className="truncate text-sm text-foreground">{children}</dd>
    </div>
  );
}
