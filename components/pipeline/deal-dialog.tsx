"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Field, fieldAria } from "@/components/shared/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fakeSubmit } from "@/lib/fake-submit";
import { dealStageOptions } from "@/lib/labels";
import {
  centsToInputValue,
  dealSchema,
  type DealFormValues,
  type DealInput,
} from "@/lib/validations/deal";
import type { DealStage, Lead } from "@/types/database";
import type { DealCardData, Person } from "@/types/views";

/**
 * Create and edit a deal — PLAN.md M7. Same shape as the lead dialog of M6: one
 * component in two modes, because the fields and the rules are identical and a
 * second dialog would be a second place to forget a field.
 *
 * The submit is still fake (`lib/fake-submit.ts`): it validates, shows the
 * pending state and confirms, but the board does not change — persistence is
 * M13, where this handler becomes a call to the Server Action and nothing else
 * here moves.
 */

/**
 * Radix refuses an empty string as an item value, so "no lead" needs a sentinel.
 * It never leaves this file: the form field itself stays "" for an unlinked
 * deal, which is what `dealInputToRow()` turns into a `null` column.
 */
const NO_LEAD = "none";

export function DealDialog({
  leads,
  owners,
  defaultOwnerId,
  defaultStage,
  deal,
  trigger,
}: {
  leads: Pick<Lead, "id" | "name">[];
  owners: Person[];
  /** Who a brand new deal belongs to — the current user. */
  defaultOwnerId?: string;
  /** Which column the deal lands in when it is created from one. */
  defaultStage?: DealStage;
  /** Present in edit mode; absent in create mode. */
  deal?: DealCardData;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(deal);

  function defaults(): DealFormValues {
    return {
      title: deal?.title ?? "",
      value: deal ? centsToInputValue(deal.value_cents) : "",
      lead_id: deal?.lead_id ?? "",
      // Editing never inherits the fallback: a deal whose owner is null has to
      // show an empty select and make the user choose, not quietly hand itself
      // to whoever opened the dialog.
      owner_id: deal
        ? (deal.owner_id ?? "")
        : (defaultOwnerId ?? owners[0]?.id ?? ""),
      due_date: deal?.due_date ?? "",
      stage: deal?.stage ?? defaultStage ?? "new",
    };
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues, unknown, DealInput>({
    resolver: zodResolver(dealSchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: DealInput) {
    await fakeSubmit();

    toast.success(
      editing ? "Negócio atualizado." : `Negócio ${values.title} criado.`,
    );
    setOpen(false);
    if (!editing) reset(defaults());
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Reopening after a cancel shows the saved values, not the half-typed
        // ones the user walked away from.
        if (next) reset(defaults());
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar negócio" : "Novo negócio"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize o valor, o prazo e a etapa deste negócio."
              : "Registre uma oportunidade para acompanhar no funil de vendas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field id="deal-title" label="Título" error={errors.title?.message}>
            <Input
              {...register("title")}
              {...fieldAria({ id: "deal-title", error: errors.title?.message })}
              placeholder="Implantação do CRM — Norte Máquinas"
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="deal-value"
              label="Valor (R$)"
              error={errors.value?.message}
            >
              <Input
                {...register("value")}
                {...fieldAria({
                  id: "deal-value",
                  error: errors.value?.message,
                })}
                inputMode="decimal"
                placeholder="14.800,00"
                className="tabular-nums"
              />
            </Field>

            <Field
              id="deal-due-date"
              label="Prazo"
              error={errors.due_date?.message}
            >
              <Input
                {...register("due_date")}
                {...fieldAria({
                  id: "deal-due-date",
                  error: errors.due_date?.message,
                })}
                type="date"
              />
            </Field>
          </div>

          <Field id="deal-lead" label="Lead" error={errors.lead_id?.message}>
            <Controller
              control={control}
              name="lead_id"
              render={({ field }) => (
                <Select
                  value={field.value === "" ? NO_LEAD : field.value}
                  onValueChange={(value) =>
                    field.onChange(value === NO_LEAD ? "" : value)
                  }
                >
                  <SelectTrigger
                    {...fieldAria({
                      id: "deal-lead",
                      error: errors.lead_id?.message,
                    })}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_LEAD}>Sem lead vinculado</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="deal-owner"
              label="Responsável"
              error={errors.owner_id?.message}
            >
              <Controller
                control={control}
                name="owner_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...fieldAria({
                        id: "deal-owner",
                        error: errors.owner_id?.message,
                      })}
                      className="w-full"
                    >
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field id="deal-stage" label="Etapa" error={errors.stage?.message}>
              <Controller
                control={control}
                name="stage"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...fieldAria({
                        id: "deal-stage",
                        error: errors.stage?.message,
                      })}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : null}
              {editing ? "Salvar alterações" : "Criar negócio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
