import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Shown where the limit bites — the leads list and the members tab — so the
 * ceiling is visible before someone hits it as an error toast. Only an Admin
 * can buy, so a Member is told who to ask instead of being sent to a page
 * whose upgrade controls are hidden from them.
 */
export function LimitNotice({
  resource,
  limit,
  isAdmin,
}: {
  /** What ran out, as a plural noun: "leads", "colaboradores". */
  resource: string;
  limit: number;
  isAdmin: boolean;
}) {
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative"
    >
      <p>
        {isAdmin
          ? `Você chegou ao limite de ${limit} ${resource} do plano Grátis. Faça upgrade para o Pro para continuar.`
          : `O workspace chegou ao limite de ${limit} ${resource} do plano Grátis. Peça a um Admin para fazer o upgrade.`}
      </p>
      {isAdmin ? (
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/billing">Ver planos</Link>
        </Button>
      ) : null}
    </div>
  );
}
