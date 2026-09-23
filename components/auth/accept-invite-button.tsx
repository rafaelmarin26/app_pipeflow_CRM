"use client";

import { useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { acceptInvite } from "@/app/(auth)/convite/[token]/_actions";
import { Button } from "@/components/ui/button";

/** Confirms an invite already validated by the Server Component — PLAN.md M15. */
export function AcceptInviteButton({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();

  function onAccept() {
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (result && "error" in result) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button onClick={onAccept} disabled={isPending} className="w-full">
      {isPending ? <LoaderCircle className="animate-spin" aria-hidden /> : null}
      Aceitar convite
    </Button>
  );
}
