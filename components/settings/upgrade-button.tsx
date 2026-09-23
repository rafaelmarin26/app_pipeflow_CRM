"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Inert until M16 wires Stripe Checkout — PLAN.md M9. */
export function UpgradeButton({ label }: { label: string }) {
  return (
    <Button
      className="w-full"
      onClick={() =>
        toast("Checkout do Pro chega em breve.", {
          description: "Essa etapa entra com a integração do Stripe.",
        })
      }
    >
      {label}
    </Button>
  );
}
