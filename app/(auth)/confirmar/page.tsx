import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-shell";
import { ConfirmEmailButton } from "@/components/auth/confirm-email-button";
import { confirmEmailSchema } from "@/lib/validations/auth";

export const metadata: Metadata = { title: "Confirmar e-mail" };

const COPY = {
  signup: {
    title: "Confirmar seu e-mail",
    description: "Falta um clique para ativar sua conta no PipeFlow CRM.",
  },
  recovery: {
    title: "Confirmar redefinição de senha",
    description: "Falta um clique para continuar a redefinição da sua senha.",
  },
} as const;

/**
 * Landing page of the e-mail link — PLAN.md M17. Deliberately does nothing
 * on load: the `token_hash` sits inert in `ConfirmEmailButton`'s props until
 * a real click spends it, which is what keeps a mail scanner's GET from
 * burning the link before the user gets to it (see `/callback`'s comment).
 */
export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>;
}) {
  const params = await searchParams;
  const parsed = confirmEmailSchema.safeParse({
    tokenHash: params.token_hash,
    type: params.type,
    next: params.next ?? "/onboarding",
  });

  if (!parsed.success) {
    return (
      <AuthCard
        title="Link inválido"
        description="Este link de confirmação está incompleto ou não é mais válido."
        footer={
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Voltar para o login
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Peça um novo convite ou crie a conta novamente.
        </p>
      </AuthCard>
    );
  }

  const copy = COPY[parsed.data.type];

  return (
    <AuthCard title={copy.title} description={copy.description}>
      <ConfirmEmailButton
        tokenHash={parsed.data.tokenHash}
        type={parsed.data.type}
        next={parsed.data.next}
      />
    </AuthCard>
  );
}
