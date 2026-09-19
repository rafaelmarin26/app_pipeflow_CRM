import {
  Building2,
  LayoutDashboard,
  ListChecks,
  SquareKanban,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";

/**
 * The six pillars — PLAN.md M3.
 *
 * Each card carries the accent rule the brand guide puts on a hovered card:
 * zero width at rest, full width under the pointer. It is the same gesture the
 * deal card on the board already makes, which is the point — a visitor who
 * signs up should recognise the product they were shown.
 */

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: SquareKanban,
    title: "Pipeline Kanban",
    description:
      "Arraste negócios entre as seis etapas do funil, do primeiro contato ao fechamento. O card move na hora, sem recarregar a tela.",
  },
  {
    icon: Users,
    title: "Gestão de leads",
    description:
      "Nome, empresa, cargo, e-mail e status de cada contato, com busca e filtros por responsável, situação e período.",
  },
  {
    icon: ListChecks,
    title: "Timeline de atividades",
    description:
      "Ligações, e-mails, reuniões e notas em ordem cronológica, presas ao lead a que pertencem. Nada se perde no histórico.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de métricas",
    description:
      "Funil de vendas, valor em aberto, taxa de conversão e os prazos que chegam primeiro, calculados sobre o seu pipeline.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description:
      "Um workspace por empresa ou por cliente, com os dados de cada um isolados no banco, não apenas escondidos na interface.",
  },
  {
    icon: UserPlus,
    title: "Convites e papéis",
    description:
      "Chame o time por e-mail e decida quem administra o workspace e quem apenas opera leads e negócios.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="label-mono text-faint">O que vem junto</p>
          <h2 className="display-lg mt-4 text-3xl text-balance text-foreground sm:text-4xl">
            Tudo o que um time de vendas usa. Nada do que ele não usa.
          </h2>
          <p className="mt-4 text-base text-pretty text-muted-foreground">
            Se uma tela precisasse de tutorial, ela não estaria aqui.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delayMs={(index % 3) * 80}>
              <article className="group relative h-full overflow-hidden rounded-lg border border-hairline bg-panel p-6 transition-colors duration-200 hover:border-brand/20 hover:bg-elevated">
                <span
                  className="absolute inset-x-0 top-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full"
                  aria-hidden
                />

                {/* Chartreuse means the reader is pointing at something, so the
                    icon only earns it on hover. At rest it is metadata. */}
                <feature.icon
                  className="size-5 text-faint transition-colors duration-200 group-hover:text-brand"
                  aria-hidden
                />

                <h3 className="display-md mt-5 text-lg text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm text-pretty text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
