"use client";

import { useTransition } from "react";
import { LoaderCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

import { cancelInvite, resendInvite } from "@/app/(app)/(shell)/settings/_actions";
import { Button } from "@/components/ui/button";

/** Resend or cancel one pending invite — PLAN.md M15, Admin only. */
export function InviteRowActions({ id, email }: { id: string; email: string }) {
  const [isResending, startResend] = useTransition();
  const [isCancelling, startCancel] = useTransition();

  function onResend() {
    startResend(async () => {
      const result = await resendInvite(id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.emailSent ? `Convite reenviado para ${email}.` : "Não foi possível enviar o e-mail agora.",
      );
    });
  }

  function onCancel() {
    startCancel(async () => {
      const result = await cancelInvite(id);
      if (result && "error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Convite cancelado.");
    });
  }

  const pending = isResending || isCancelling;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Reenviar convite para ${email}`}
        title="Reenviar"
        onClick={onResend}
        disabled={pending}
      >
        {isResending ? <LoaderCircle className="animate-spin" aria-hidden /> : <Send aria-hidden />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Cancelar convite para ${email}`}
        title="Cancelar"
        onClick={onCancel}
        disabled={pending}
        className="text-muted-foreground hover:text-lost-ink"
      >
        {isCancelling ? <LoaderCircle className="animate-spin" aria-hidden /> : <X aria-hidden />}
      </Button>
    </div>
  );
}
