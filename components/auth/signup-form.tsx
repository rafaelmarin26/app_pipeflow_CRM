"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, MailCheckIcon } from "lucide-react";

import { signup } from "@/app/(auth)/signup/_actions";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { FormError } from "@/components/shared/form-error";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  passwordRules,
  signupSchema,
  type SignupInput,
} from "@/lib/validations/auth";

/**
 * PLAN.md M11: `signup` creates the account and redirects to onboarding
 * itself when the project lets a session through immediately. This project
 * has e-mail confirmation on, so the usual outcome is `needsConfirmation`
 * instead — rendered as a neutral panel, not `FormError`, since sending the
 * link is a success, not a failure.
 */
export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const password = watch("password");

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    const result = await signup(values);
    if (result && "error" in result) {
      setFormError(result.error);
    } else if (result && "needsConfirmation" in result) {
      setConfirmationSentTo(values.email);
    }
  }

  if (confirmationSentTo) {
    return (
      <div className="space-y-2">
        <MailCheckIcon className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm">
          Enviamos um link de confirmação para{" "}
          <span className="font-medium">{confirmationSentTo}</span>.
        </p>
        <p className="text-xs text-muted-foreground">
          Abra-o para ativar sua conta e continuar. Confira também a caixa de spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={formError} />

      <Field id="name" label="Nome" error={errors.name?.message}>
        <Input
          {...register("name")}
          {...fieldAria({ id: "name", error: errors.name?.message })}
          autoComplete="name"
          placeholder="Rafael Marin"
          autoFocus
        />
      </Field>

      <Field id="email" label="E-mail" error={errors.email?.message}>
        <Input
          {...register("email")}
          {...fieldAria({ id: "email", error: errors.email?.message })}
          type="email"
          autoComplete="email"
          placeholder="voce@empresa.com.br"
        />
      </Field>

      <Field
        id="password"
        label="Senha"
        error={errors.password?.message}
        hint={<PasswordRules value={password} />}
      >
        <PasswordInput
          {...register("password")}
          {...fieldAria({
            id: "password",
            error: errors.password?.message,
            hint: true,
          })}
          autoComplete="new-password"
        />
      </Field>

      <SubmitButton pending={isSubmitting} pendingLabel="Criando conta...">
        Criar conta
      </SubmitButton>
    </form>
  );
}

/**
 * The rules are on screen from the start, not revealed by failing. Met rules are
 * marked with a check and full-contrast text — never with green, which CLAUDE.md
 * §7 reserves for a won deal.
 */
function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="space-y-1">
      {passwordRules.map((rule) => {
        const met = rule.test(value);

        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5",
              met && "text-foreground",
            )}
          >
            <CheckIcon
              className={cn("size-3", met ? "opacity-100" : "opacity-30")}
              aria-hidden
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
