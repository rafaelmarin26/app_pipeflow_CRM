"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Plan } from "@/types/database";

const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 8;

/**
 * What the user sees after coming back from Stripe Checkout. The redirect can
 * land a moment before the webhook has written the subscription, so while the
 * workspace is still Free this re-reads the server a few times. It never
 * decides the plan itself — the banner only reflects `plan`, which comes from
 * the database (CLAUDE.md §5).
 */
export function CheckoutNotice({
  checkout,
  plan,
}: {
  checkout: "success" | "cancelled";
  plan: Plan;
}) {
  const router = useRouter();
  const [polls, setPolls] = useState(0);

  const waiting = checkout === "success" && plan === "free" && polls < MAX_POLLS;

  useEffect(() => {
    if (!waiting) return;

    const timer = setTimeout(() => {
      setPolls((count) => count + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [waiting, polls, router]);

  if (checkout === "cancelled") {
    return (
      <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
        Pagamento cancelado. Nada foi cobrado.
      </p>
    );
  }

  if (plan === "pro") {
    return (
      <p className="rounded-md border border-positive/30 bg-positive/10 px-3 py-2 text-sm text-positive">
        Assinatura confirmada. Este workspace agora está no plano Pro.
      </p>
    );
  }

  return (
    <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
      {waiting
        ? "Pagamento recebido. Confirmando a assinatura…"
        : "A confirmação está demorando mais que o normal. Atualize a página em instantes."}
    </p>
  );
}
