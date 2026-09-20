"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/errors";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { resolvePostLoginRedirect } from "@/lib/workspace";

/**
 * Signs the user in and sends them to their last workspace, or onboarding if
 * they have none yet — PLAN.md M11. Validate → execute → redirect: there is no
 * "resolver workspace ativo" step before auth here, since which workspace is
 * active depends on who just authenticated.
 */
export async function login(values: LoginInput): Promise<{ error: string } | void> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Preencha e-mail e senha corretamente." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error) };
  }

  const redirectTo = await resolvePostLoginRedirect(supabase, data.user.id);
  redirect(redirectTo);
}
