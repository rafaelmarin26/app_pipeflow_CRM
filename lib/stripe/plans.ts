import type { Plan } from "@/types/database";

/**
 * The commercial shape of the two plans — CLAUDE.md §3 and §5.
 *
 * One file so the price on the landing page, the usage bars in Settings (M9)
 * and the limit checks inside the Server Actions (M16) can never disagree. A
 * price shown on a public page and a price actually charged have to come from
 * the same constant, or the day they drift is the day someone pays the wrong
 * amount.
 *
 * Money is in integer cents, like everywhere else in the product (§4).
 */

/** Ceilings of the Free plan. Enforced on the server in M16, never only in the UI. */
export const FREE_LIMITS = {
  members: 2,
  leads: 50,
} as const;

export const PRO_PRICE_CENTS = 4_900;

export type PlanOffer = {
  id: Plan;
  /** Commercial name. Matches PLAN_LABELS so the product uses one word per plan. */
  name: string;
  priceCents: number;
  /** Shown after the price. Null on a plan that is not billed. */
  period: string | null;
  tagline: string;
  features: string[];
  cta: string;
  /** The Pro card carries the brand edge; exactly one offer may be highlighted. */
  highlighted: boolean;
};

export const PLAN_OFFERS: PlanOffer[] = [
  {
    id: "free",
    name: "Grátis",
    priceCents: 0,
    period: null,
    tagline: "Para quem está organizando o funil pela primeira vez.",
    features: [
      `Até ${FREE_LIMITS.members} membros no time`,
      `Até ${FREE_LIMITS.leads} leads cadastrados`,
      "Pipeline Kanban com as seis etapas",
      "Timeline de atividades por lead",
      "Dashboard de métricas completo",
    ],
    cta: "Começar grátis",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceCents: PRO_PRICE_CENTS,
    period: "/mês",
    tagline: "Para o time que já vive dentro do pipeline.",
    features: [
      "Membros ilimitados",
      "Leads e negócios ilimitados",
      "Workspaces ilimitados para suas empresas",
      "Tudo o que está no plano Grátis",
      "Suporte prioritário por e-mail",
    ],
    cta: "Assinar o Pro",
    highlighted: true,
  },
];
