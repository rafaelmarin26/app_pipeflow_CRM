import { DEAL_STAGE_LABELS } from "@/lib/labels";
import { STAGE_BG, STAGE_TEXT } from "@/lib/stage-styles";
import { cn, formatCurrency } from "@/lib/utils";
import type { DealStage } from "@/types/database";

/**
 * The visual proof in the hero — PLAN.md M3, and principle 1 of CLAUDE.md §7:
 * the Kanban is the hero, so the page that sells the product shows it.
 *
 * A still life, not the board. The real one in `components/pipeline/` carries
 * dnd-kit, its sensors and its keyboard handling; none of that belongs in the
 * bundle of a public page whose job is to be a picture. This is a Server
 * Component and ships no JavaScript at all.
 *
 * What it does share is the vocabulary: stage colours out of `lib/stage-styles`
 * and stage names out of `lib/labels`, so the screenshot on the landing can
 * never show a funnel the product does not have.
 */

type PreviewCard = {
  title: string;
  lead: string;
  valueCents: number;
};

const PREVIEW: { stage: DealStage; cards: PreviewCard[] }[] = [
  {
    stage: "contacted",
    cards: [
      { title: "Gestão de frota", lead: "Ferreira Logística", valueCents: 2_340_000 },
      { title: "Expansão de franquias", lead: "Orizon Foods", valueCents: 5_120_000 },
    ],
  },
  {
    stage: "proposal",
    cards: [
      { title: "Plataforma comercial", lead: "Lumina Tech", valueCents: 4_750_000 },
      { title: "Licenças para o time", lead: "Trilho Educação", valueCents: 1_190_000 },
    ],
  },
  {
    stage: "negotiation",
    cards: [
      { title: "Reestruturação do funil", lead: "Atlas Consultoria", valueCents: 6_400_000 },
      { title: "Renovação ampliada", lead: "TransFácil", valueCents: 3_950_000 },
    ],
  },
];

export function KanbanPreview() {
  return (
    <div
      // Decorative: the sentence above it already says what the product does,
      // and reading three columns of invented deal names aloud helps nobody.
      aria-hidden
      className="overflow-hidden rounded-lg border border-hairline bg-panel"
    >
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-3">
        <span className="size-2 rounded-full bg-stage-lost/70" />
        <span className="size-2 rounded-full bg-stage-negotiation/70" />
        <span className="size-2 rounded-full bg-stage-won/70" />
        <span className="label-mono ml-2 text-faint">Pipeline</span>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-3">
        {PREVIEW.map((column) => (
          <div
            key={column.stage}
            className="flex flex-col overflow-hidden rounded-md border border-hairline bg-canvas/40"
          >
            <div className={cn("h-0.5 w-full", STAGE_BG[column.stage])} />

            <div className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2.5">
              <span className={cn("label-mono truncate", STAGE_TEXT[column.stage])}>
                {DEAL_STAGE_LABELS[column.stage]}
              </span>
              <span className="money text-[11px] text-faint">
                {column.cards.length}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-2">
              {column.cards.map((card) => (
                <article
                  key={card.title}
                  className="space-y-2 rounded-md border border-hairline bg-panel p-3"
                >
                  <p className="text-sm leading-snug font-medium text-foreground">
                    {card.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {card.lead}
                  </p>
                  <p
                    className={cn(
                      "money text-sm font-semibold",
                      STAGE_TEXT[column.stage],
                    )}
                  >
                    {formatCurrency(card.valueCents)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
