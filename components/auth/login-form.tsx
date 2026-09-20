"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { login } from "@/app/(auth)/login/_actions";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { FormError } from "@/components/shared/form-error";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

/**
 * PLAN.md M11: `login` signs the user in and redirects on success by calling
 * `redirect()` itself, so this component only ever needs to handle the
 * `{ error }` shape it returns on failure.
 */
export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await login(values);
    if (result?.error) {
      setFormError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormError message={formError} />

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

      <Field id="password" label="Senha" error={errors.password?.message}>
        <PasswordInput
          {...register("password")}
          {...fieldAria({ id: "password", error: errors.password?.message })}
          autoComplete="current-password"
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/recuperar-senha"
          className="rounded-md text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      <SubmitButton pending={isSubmitting} pendingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
