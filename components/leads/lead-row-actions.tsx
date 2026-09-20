"use client";

import { Pencil, Trash } from "lucide-react";

import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadDialog } from "@/components/leads/lead-dialog";
import { Button } from "@/components/ui/button";
import type { LeadWithOwner, Person } from "@/types/views";

/**
 * Edit and delete for one row. Two icon buttons rather than a "…" menu: with
 * exactly two actions a menu only adds a click, and each button can own its own
 * dialog trigger instead of reopening one after the menu unmounts.
 */
export function LeadRowActions({
  lead,
  owners,
}: {
  lead: LeadWithOwner;
  owners: Person[];
}) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <LeadDialog
        owners={owners}
        lead={lead}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Editar ${lead.name}`}
            title="Editar"
          >
            <Pencil aria-hidden />
          </Button>
        }
      />

      <DeleteLeadDialog
        leadId={lead.id}
        leadName={lead.name}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Excluir ${lead.name}`}
            title="Excluir"
            className="text-muted-foreground hover:text-lost-ink"
          >
            <Trash aria-hidden />
          </Button>
        }
      />
    </div>
  );
}
