"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { Field, fieldAria } from "@/components/shared/field";
import { Input } from "@/components/ui/input";
import { fakeSubmit } from "@/lib/fake-submit";
import { cn } from "@/lib/utils";
import {
  passwordRules,
  signupSchema,
  type SignupInput,
} from "@/lib/validations/auth";

/**
 * Signup — PLAN.md M5. Leads to onboarding, because a brand new account has no
 * workspace yet. M11 turns this into the real Supabase sign-up.
 */
export function SignupForm() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

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
  const pending = isSubmitting || redirecting;

  async function onSubmit(values: SignupInput) {
    await fakeSubmit();
    setRedirecting(true);
    toast.success(`Conta criada. Bem-vindo, ${values.name.split(" ")[0]}.`);
    router.push("/onboarding");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
          placeholder="••••••••"
        />
      </Field>

      <SubmitButton pending={pending} pendingLabel="Criando conta...">
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
