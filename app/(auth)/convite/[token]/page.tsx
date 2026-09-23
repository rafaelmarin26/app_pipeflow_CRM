import type { Metadata } from "next";
import Link from "next/link";

import { signOut } from "@/app/(app)/(shell)/_actions";
import { AuthCard } from "@/components/auth/auth-shell";
import { AcceptInviteButton } from "@/components/auth/accept-invite-button";
import { Button } from "@/components/ui/button";
import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const metadata: Metadata = { title: "Aceitar convite" };

/**
 * Public accept-invite screen — PLAN.md M5/M15. Reads through the service
 * role client (CLAUDE.md §5): a visitor who is not yet a workspace member has
 * no RLS path to this invite row at all, signed in or not.
 *
 * Deliberately does not thread a `?next=` through `/login` and `/signup` —
 * doing that correctly would touch M11's auth actions, out of scope here.
 * Instead, a signed-out visitor is told in plain PT-BR to come back to this
 * same link once they have an account.
 */
export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const service = createServiceRoleClient();
  const { data: invite } = await service
    .from("invites")
    .select(
      "email, role, expires_at, accepted_at, workspace:workspace_id(name), inviter:invited_by(name)",
    )
    .eq("token", token)
    .maybeSingle();

  if (!invite) {
    return (
      <AuthCard
        title="Convite inválido"
        description="Este link não existe ou o convite foi cancelado. Peça um novo a quem te convidou."
      >
        <Button asChild className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </AuthCard>
    );
  }

  if (invite.accepted_at) {
    return (
      <AuthCard
        title="Convite já utilizado"
        description="Este convite já foi aceito. Entre normalmente com sua conta."
      >
        <Button asChild className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </AuthCard>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <AuthCard
        title="Convite expirado"
        description="Peça à pessoa que te convidou para enviar um novo link."
      >
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Ir para o login</Link>
        </Button>
      </AuthCard>
    );
  }

  const workspaceName = invite.workspace?.name ?? "um workspace";
  const inviterName = invite.inviter?.name ?? "Alguém do time";
  const roleLabel = MEMBER_ROLE_LABELS[invite.role];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AuthCard
        title={`Convite para ${workspaceName}`}
        description={`${inviterName} te convidou para entrar como ${roleLabel}.`}
      >
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/signup">Criar conta e aceitar</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Já tenho conta</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Depois de entrar, volte a este mesmo link para aceitar o convite.
          </p>
        </div>
      </AuthCard>
    );
  }

  const emailMatches = invite.email.toLowerCase() === (user.email ?? "").toLowerCase();

  if (!emailMatches) {
    return (
      <AuthCard
        title={`Convite para ${workspaceName}`}
        description={`Este convite foi enviado para ${invite.email}, mas você está logado como ${user.email}.`}
      >
        <form action={signOut}>
          <Button type="submit" variant="outline" className="w-full">
            Sair e entrar com outra conta
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={`Convite para ${workspaceName}`}
      description={`${inviterName} te convidou para entrar como ${roleLabel}.`}
    >
      <AcceptInviteButton token={token} />
    </AuthCard>
  );
}
