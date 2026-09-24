"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createPortalSession } from "@/app/(app)/(shell)/settings/billing/_actions";
import { Button } from "@/components/ui/button";

export function ManageSubscriptionButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await createPortalSession();

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      window.location.assign(result.url);
    });
  }

  return (
    <Button variant="outline" disabled={pending} onClick={handleClick}>
      {pending ? "Abrindo portal…" : "Gerenciar assinatura"}
    </Button>
  );
}
