"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";

import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { fakeSubmit } from "@/lib/fake-submit";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

/**
 * Destination of the "esqueci minha senha" link on the login screen. M11 wires it
 * to `resetPasswordForEmail` and adds the screen that consumes the link.
 */
export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    await fakeSubmit();
    setSentTo(values.email);
  }

  if (sentTo) {
    return (
      <div className="space-y-2">
        <MailCheckIcon className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm">
          Enviamos um link de redefinição para{" "}
          <span className="font-medium">{sentTo}</span>.
        </p>
        <p className="text-xs text-muted-foreground">
          O link vale por uma hora. Confira também a caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          {...register("email")}
          {...fieldAria({ id: "email", error: errors.email?.message })}
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com.br"
          autoFocus
        />
      </Field>

      <SubmitButton pending={isSubmitting} pendingLabel="Enviando...">
        Enviar link de redefinição
      </SubmitButton>
    </form>
  );
}
