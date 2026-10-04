"use client";

import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { confirmEmail } from "@/app/(auth)/confirmar/_actions";
import { Button } from "@/components/ui/button";
import type { ConfirmEmailInput } from "@/lib/validations/auth";

/**
 * The real click that `/confirmar` exists to require — PLAN.md M17. A mail
 * scanner's GET loads this page and stops there; only a person pressing the
 * button runs `confirmEmail` and spends the one-time token.
 */
export function ConfirmEmailButton({ tokenHash, type, next }: ConfirmEmailInput) {
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await confirmEmail({ tokenHash, type, next });
      if (result && "error" in result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={onConfirm} disabled={isPending} className="w-full">
      {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
      Confirmar e-mail
    </Button>
  );
}
