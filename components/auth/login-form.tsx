"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { fakeSubmit } from "@/lib/fake-submit";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

/**
 * M5 is interface only: the fields are validated, but no credential is checked.
 * M11 swaps `fakeSubmit` for the sign-in Server Action and surfaces its
 * `{ error }` as a form-level message — the markup below does not change.
 */
export function LoginForm() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Stays locked through the navigation: the form unmounts only once the
  // dashboard has rendered, and an enabled button in between invites a second click.
  const pending = isSubmitting || redirecting;

  async function onSubmit() {
    await fakeSubmit();
    setRedirecting(true);
    toast.success("Sessão iniciada.");
    router.push("/dashboard");
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

      <SubmitButton pending={pending} pendingLabel="Entrando...">
        Entrar
      </SubmitButton>
    </form>
  );
}
