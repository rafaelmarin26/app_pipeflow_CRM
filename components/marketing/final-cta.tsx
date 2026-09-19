import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { Button } from "@/components/ui/button";

/** The closing ask — PLAN.md M3. One button, the same destination as every other. */
export function FinalCta() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg border border-hairline bg-panel px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* The modular grid the access screens already use as the brand's
                structure, instead of the glow v1 would have put here. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "radial-gradient(60% 60% at 50% 50%, #000 0%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(60% 60% at 50% 50%, #000 0%, transparent 100%)",
              }}
            />

            <div className="relative">
              <h2 className="display-lg mx-auto max-w-2xl text-3xl text-balance text-foreground sm:text-4xl">
                Comece a organizar seu funil ainda hoje.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-pretty text-muted-foreground">
                Leva menos tempo criar o workspace do que ler esta página até o
                fim.
              </p>

              <Button asChild size="lg" className="mt-9">
                <Link href="/signup">Começar grátis</Link>
              </Button>

              <p className="label-mono mt-5 text-faint">
                Sem cartão de crédito
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
