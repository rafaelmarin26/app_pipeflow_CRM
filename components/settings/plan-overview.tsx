import { Check } from "lucide-react";

import { UpgradeButton } from "@/components/settings/upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PLAN_LABELS } from "@/lib/labels";
import { FREE_LIMITS, PLAN_OFFERS } from "@/lib/stripe/plans";
import { cn, formatCurrency } from "@/lib/utils";
import type { Plan } from "@/types/database";

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const atLimit = used >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("money", atLimit ? "text-negative" : "text-foreground")}>
          {used} de {limit}
        </span>
      </div>
      <Progress value={Math.min(100, (used / limit) * 100)} />
    </div>
  );
}

/**
 * Plan tab — PLAN.md M9. Reads usage against `lib/stripe/plans.ts`, the same
 * file M16's Server Actions check against, so the bar and the eventual
 * server-side block can never disagree about the ceiling.
 */
export function PlanOverview({
  plan,
  leadsCount,
  membersCount,
  isAdmin,
}: {
  plan: Plan;
  leadsCount: number;
  membersCount: number;
  isAdmin: boolean;
}) {
  const isFree = plan === "free";

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plano atual</CardTitle>
            <Badge variant={isFree ? "secondary" : "default"}>{PLAN_LABELS[plan]}</Badge>
          </div>
          <CardDescription>
            {isFree
              ? "Uso do plano Grátis neste workspace."
              : "Sem limites de leads ou colaboradores neste workspace."}
          </CardDescription>
        </CardHeader>

        {isFree ? (
          <CardContent className="space-y-4">
            <UsageBar label="Colaboradores" used={membersCount} limit={FREE_LIMITS.members} />
            <UsageBar label="Leads" used={leadsCount} limit={FREE_LIMITS.leads} />

            {membersCount >= FREE_LIMITS.members || leadsCount >= FREE_LIMITS.leads ? (
              <p className="rounded-md border border-negative/30 bg-negative/10 px-3 py-2 text-sm text-negative">
                Limite do plano Grátis atingido. Faça upgrade para o Pro para continuar
                crescendo sem esperar.
              </p>
            ) : null}
          </CardContent>
        ) : null}
      </Card>

      {isAdmin && isFree ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {PLAN_OFFERS.map((offer) => {
            const isCurrent = offer.id === plan;

            return (
              <Card key={offer.id} className={cn(offer.highlighted && "border-brand/40")}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{offer.name}</CardTitle>
                    {isCurrent ? <Badge variant="secondary">Atual</Badge> : null}
                  </div>
                  <p className="flex items-baseline gap-1">
                    <span className="money text-2xl font-semibold text-foreground">
                      {formatCurrency(offer.priceCents)}
                    </span>
                    {offer.period ? (
                      <span className="money text-xs text-faint">{offer.period}</span>
                    ) : null}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {offer.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? null : <UpgradeButton label={offer.cta} />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
