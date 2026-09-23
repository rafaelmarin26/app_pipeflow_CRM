"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { inviteMember } from "@/app/(app)/(shell)/settings/_actions";
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
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { inviteSchema, type InviteInput } from "@/lib/validations/invite";

const DEFAULTS: InviteInput = { email: "", role: "member" };

/** Invite a collaborator by e-mail — PLAN.md M15, Admin only (the page already gated this). */
export function InviteDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: DEFAULTS,
  });

  async function onSubmit(values: InviteInput) {
    const result = await inviteMember(values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(
      result.emailSent
        ? `Convite enviado para ${values.email}.`
        : `Convite criado, mas o e-mail não pôde ser enviado agora. Use "Reenviar" na lista.`,
    );
    setOpen(false);
    reset(DEFAULTS);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) reset(DEFAULTS);
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden />
          Convidar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Convidar colaborador</DialogTitle>
          <DialogDescription>
            Enviamos um link de convite por e-mail, válido por 7 dias.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field id="invite-email" label="E-mail" error={errors.email?.message}>
            <Input
              {...register("email")}
              {...fieldAria({ id: "invite-email", error: errors.email?.message })}
              type="email"
              autoComplete="email"
              placeholder="pessoa@empresa.com.br"
              autoFocus
            />
          </Field>

          <Field id="invite-role" label="Papel" error={errors.role?.message}>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    {...fieldAria({ id: "invite-role", error: errors.role?.message })}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MEMBER_ROLE_LABELS) as (keyof typeof MEMBER_ROLE_LABELS)[]).map(
                      (value) => (
                        <SelectItem key={value} value={value}>
                          {MEMBER_ROLE_LABELS[value]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
