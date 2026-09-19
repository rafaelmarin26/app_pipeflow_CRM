import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";
import { PLAN_OFFERS } from "@/lib/stripe/plans";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Plans — PLAN.md M3.
 *
 * Every number on this section comes from `lib/stripe/plans.ts`, including the
 * two Free ceilings. The price a visitor reads here and the price the Server
 * Action enforces in M16 are the same constant, which is the only way they stay
 * equal after someone changes one of them.
 */
export function Pricing() {
  return (
    <section id="planos" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label-mono text-faint">Planos</p>
          <h2 className="display-lg mt-4 text-3xl text-balance text-foreground sm:text-4xl">
            Um plano gratuito de verdade, e um que cresce com o time.
          </h2>
          <p className="mt-4 text-base text-pretty text-muted-foreground">
            Sem cobrança por funcionalidade escondida atrás de um contato
            comercial. O que está na lista é o que você recebe.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-5 md:grid-cols-2">
          {PLAN_OFFERS.map((plan, index) => (
            <Reveal key={plan.id} delayMs={index * 90}>
              <article
                className={cn(
                  "relative h-full overflow-hidden rounded-lg border bg-panel p-7",
                  plan.highlighted
                    ? "border-brand/40"
                    : "border-hairline",
                )}
              >
                {/* The one place a full-width accent rule sits at rest rather
                    than on hover: it is marking the recommended plan, which is
                    information the reader needs before pointing at anything. */}
                {plan.highlighted ? (
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 bg-brand"
                    aria-hidden
                  />
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <h3 className="display-md text-xl text-foreground">
                    {plan.name}
                  </h3>
                  {plan.highlighted ? (
                    <span className="label-mono rounded-sm bg-brand/10 px-2 py-1 text-brand">
                      Recomendado
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>

                <p className="mt-7 flex items-baseline gap-1.5">
                  <span className="money text-4xl font-semibold text-foreground">
                    {formatCurrency(plan.priceCents)}
                  </span>
                  {plan.period ? (
                    <span className="money text-sm text-faint">
                      {plan.period}
                    </span>
                  ) : null}
                </p>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-7 w-full"
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>

                <ul className="mt-8 space-y-3 border-t border-hairline pt-7">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-positive"
                        aria-hidden
                      />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
