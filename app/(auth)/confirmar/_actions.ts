"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/errors";
import { safeNextPath } from "@/lib/safe-redirect";
import { confirmEmailSchema, type ConfirmEmailInput } from "@/lib/validations/auth";

/**
 * Consumes the `token_hash` from a signup or recovery e-mail — PLAN.md M17.
 * Only reachable from a real click on `/confirmar`'s button, never from the
 * e-mail link's own GET: that distinction is the whole point, since a bare
 * GET is exactly what a mail provider's link scanner also sends.
 */
export async function confirmEmail(
  input: ConfirmEmailInput,
): Promise<{ error: string } | void> {
  const parsed = confirmEmailSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Link de confirmação inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: parsed.data.type,
    token_hash: parsed.data.tokenHash,
  });

  if (error) {
    return { error: translateAuthError(error) };
  }

  redirect(safeNextPath(parsed.data.next));
}
