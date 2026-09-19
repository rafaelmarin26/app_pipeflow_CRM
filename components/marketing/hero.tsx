import type { CSSProperties } from "react";
import Link from "next/link";

import { KanbanPreview } from "@/components/marketing/kanban-preview";
import { Button } from "@/components/ui/button";

/**
 * Hero — PLAN.md M3.
 *
 * Above the fold at load, so the entrance runs on plain animation delays rather
 * than on an observer: four elements, each a beat behind the one before it.
 * CLAUDE.md §7 names both triggers; the delay is the one that needs no
 * JavaScript, which is the right trade for the first thing a visitor sees.
 */

/** Milliseconds between one element of the cascade and the next. */
const BEAT = 90;

function beat(index: number): CSSProperties {
  return { "--stagger": `${index * BEAT}ms` } as CSSProperties;
}

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="panel-in label-mono text-faint" style={beat(0)}>
          CRM de vendas para times pequenos
        </p>

        <h1
          className="panel-in display-xl mt-5 text-4xl leading-[1.05] text-balance text-foreground sm:text-6xl"
          style={beat(1)}
        >
          Seu funil de vendas inteiro em uma tela.
        </h1>

        <p
          className="panel-in mx-auto mt-6 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg"
          style={beat(2)}
        >
          O PipeFlow organiza leads, negócios e atividades num pipeline que você
          entende no primeiro minuto. Comece de graça, sem cartão e sem prazo
          para acabar.
        </p>

        {/* One filled chartreuse button per screen (§7). The second action is an
            outline, so the eye still knows which one is the way forward. */}
        <div
          className="panel-in mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={beat(3)}
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">Começar grátis</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <a href="#planos">Ver os planos</a>
          </Button>
        </div>
      </div>

      <div className="panel-in mt-16 sm:mt-20" style={beat(4)}>
        <KanbanPreview />
      </div>
    </section>
  );
}
