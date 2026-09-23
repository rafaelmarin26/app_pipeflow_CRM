import { Resend } from "resend";

import { MEMBER_ROLE_LABELS } from "@/lib/labels";
import type { MemberRole } from "@/types/database";

/**
 * Collaborator invites over Resend — PLAN.md M15. `RESEND_API_KEY` is server
 * only (CLAUDE.md §5), so this module is only ever imported from a Server
 * Action, never from a Client Component.
 *
 * The sender address is Resend's own sandbox domain: verifying a custom
 * domain is a M17 production concern, and the sandbox still delivers to a
 * real inbox for development and staging.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "PipeFlow CRM <onboarding@resend.dev>";

function inviteEmailHtml({
  workspaceName,
  inviterName,
  role,
  acceptUrl,
}: {
  workspaceName: string;
  inviterName: string;
  role: MemberRole;
  acceptUrl: string;
}): string {
  const roleLabel = MEMBER_ROLE_LABELS[role];

  return `
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background-color:#0C0C0E;font-family:'DM Sans',Arial,sans-serif;color:#E8E8E8;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="padding-bottom:24px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background-color:#CAFF33;color:#0C0C0E;font-family:Georgia,serif;font-weight:700;font-size:18px;">P</span>
        </td>
      </tr>
      <tr>
        <td style="background-color:#141416;border:1px solid #2A2A2E;border-radius:8px;padding:32px;">
          <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#E8E8E8;">
            ${inviterName} convidou você para o workspace <strong>${workspaceName}</strong>
          </h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.65;color:#8A8A8F;">
            Você vai entrar como <strong style="color:#E8E8E8;">${roleLabel}</strong> no PipeFlow CRM, o pipeline de vendas da equipe.
          </p>
          <a href="${acceptUrl}" style="display:inline-block;background-color:#CAFF33;color:#0C0C0E;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:6px;">
            Aceitar convite
          </a>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.65;color:#83838B;">
            O convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();
}

/**
 * Sends the invite e-mail; returns whether it went out. Failures are
 * swallowed into a boolean rather than thrown because the invite row is
 * already saved by the time this runs (CLAUDE.md §3's "executar" step) — a
 * delivery failure is a reason to let the Admin resend, not to roll back the
 * invite itself.
 */
export async function sendInviteEmail({
  to,
  workspaceName,
  inviterName,
  role,
  token,
}: {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: MemberRole;
  token: string;
}): Promise<boolean> {
  const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: `Convite para o workspace ${workspaceName}`,
    html: inviteEmailHtml({ workspaceName, inviterName, role, acceptUrl }),
  });

  return !error;
}
