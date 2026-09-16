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
import { leadStatusOptions } from "@/lib/labels";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import type { LeadWithOwner, Person } from "@/types/views";

/**
 * Create and edit a lead — PLAN.md M6. One component in two modes, because the
 * fields, the rules and the layout are identical and a second dialog would be a
 * second place to forget a field.
 *
 * The submit is still fake (`lib/fake-submit.ts`): it validates, shows the
 * pending state and confirms, but the list does not change — persistence is M12,
 * where this handler becomes a call to the Server Action and nothing else here
 * moves.
 */
export function LeadDialog({
  owners,
  lead,
  trigger,
  defaultOwnerId,
}: {
  owners: Person[];
  /** Present in edit mode; absent in create mode. */
  lead?: LeadWithOwner;
  trigger: React.ReactNode;
  /** Who a brand new lead belongs to — the current user. */
  defaultOwnerId?: string;
}) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(lead);

  function defaults(): LeadInput {
    return {
      name: lead?.name ?? "",
      email: lead?.email ?? "",
      phone: lead?.phone ?? "",
      company: lead?.company ?? "",
      job_title: lead?.job_title ?? "",
      status: lead?.status ?? "new",
      // Editing never inherits the fallback: a lead whose owner is null has to
      // show an empty select and make the user choose, not quietly hand itself
      // to whoever opened the dialog.
      owner_id: lead
        ? (lead.owner_id ?? "")
        : (defaultOwnerId ?? owners[0]?.id ?? ""),
    };
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: defaults(),
  });

  async function onSubmit(values: LeadInput) {
    await fakeSubmit();

    toast.success(
      editing
        ? "Lead atualizado."
        : `Lead ${values.name.split(" ")[0]} cadastrado.`,
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
          <DialogTitle>{editing ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize os dados de contato e o estágio do relacionamento."
              : "Cadastre um contato para acompanhar o relacionamento e registrar atividades."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field id="lead-name" label="Nome" error={errors.name?.message}>
            <Input
              {...register("name")}
              {...fieldAria({ id: "lead-name", error: errors.name?.message })}
              autoComplete="name"
              placeholder="Helena Vasconcelos"
              autoFocus
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="lead-email" label="E-mail" error={errors.email?.message}>
              <Input
                {...register("email")}
                {...fieldAria({
                  id: "lead-email",
                  error: errors.email?.message,
                })}
                type="email"
                autoComplete="email"
                placeholder="helena@empresa.com.br"
              />
            </Field>

            <Field
              id="lead-phone"
              label="Telefone"
              error={errors.phone?.message}
            >
              <Input
                {...register("phone")}
                {...fieldAria({
                  id: "lead-phone",
                  error: errors.phone?.message,
                })}
                type="tel"
                autoComplete="tel"
                placeholder="(11) 98812-4407"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="lead-company"
              label="Empresa"
              error={errors.company?.message}
            >
              <Input
                {...register("company")}
                {...fieldAria({
                  id: "lead-company",
                  error: errors.company?.message,
                })}
                autoComplete="organization"
                placeholder="Lumina Tech"
              />
            </Field>

            <Field
              id="lead-job-title"
              label="Cargo"
              error={errors.job_title?.message}
            >
              <Input
                {...register("job_title")}
                {...fieldAria({
                  id: "lead-job-title",
                  error: errors.job_title?.message,
                })}
                autoComplete="organization-title"
                placeholder="Diretora de Operações"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="lead-status"
              label="Status"
              error={errors.status?.message}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      {...fieldAria({
                        id: "lead-status",
                        error: errors.status?.message,
                      })}
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leadStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field
              id="lead-owner"
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
                        id: "lead-owner",
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
              {editing ? "Salvar alterações" : "Cadastrar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
