import { z } from "zod";

/**
 * Auth schemas — PLAN.md M5.
 *
 * The messages live in the schema, in PT-BR, because this same object validates
 * the form in the browser and the Server Action in M11. One source of truth for
 * the rule and for the sentence the user reads when they break it.
 */

const email = z
  .string()
  .min(1, "Informe seu e-mail.")
  .pipe(z.email("Informe um e-mail válido."));

/**
 * Password rules, kept as a list so the signup form can render them as a visible
 * checklist instead of only revealing them on failure.
 */
export const passwordRules = [
  {
    id: "length",
    label: "Pelo menos 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "letter",
    label: "Uma letra",
    test: (value: string) => /\p{L}/u.test(value),
  },
  {
    id: "number",
    label: "Um número",
    test: (value: string) => /\d/.test(value),
  },
] as const;

const password = z
  .string()
  .min(1, "Informe uma senha.")
  .refine((value) => passwordRules.every((rule) => rule.test(value)), {
    message: "A senha precisa ter 8 caracteres, uma letra e um número.",
  });

export const loginSchema = z.object({
  email,
  // Login only checks that something was typed: the rules above are a signup
  // concern, and an existing account may predate a rule change.
  password: z.string().min(1, "Informe sua senha."),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "Informe seu nome.")
    .min(2, "Informe seu nome completo.")
    .max(120, "Use no máximo 120 caracteres."),
  email,
  password,
});

export const forgotPasswordSchema = z.object({ email });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
