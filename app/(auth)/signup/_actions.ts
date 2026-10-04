"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/errors";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

/**
 * Creates the account and sends the user straight to onboarding — PLAN.md M11.
 * A brand new account never has a workspace, so there is nothing to resolve
 * here the way `login`'s action does.
 *
 * This project has e-mail confirmation ON (confirmed live against the
 * Supabase project), so `signUp` comes back with `data.session === null`
 * until the user clicks the confirmation link. The "Confirm signup" e-mail
 * template (Supabase Dashboard) sends that link to `/confirmar`, not here —
 * `emailRedirectTo` is kept only as the fallback `{{ .RedirectTo }}` would
 * resolve to if the template ever reverts to Supabase's default.
 */
export type SignupResult = { error: string } | { needsConfirmation: true } | void;

export async function signup(values: SignupInput): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Confira os dados informados." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/onboarding`,
    },
  });

  if (error) {
    return { error: translateAuthError(error) };
  }

  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect("/onboarding");
}
