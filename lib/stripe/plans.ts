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

/**
 * Whether inviting one more person would break the Free ceiling. Pulled
 * forward from M16 into M15's `inviteMember` action — counting rows needs no
 * Stripe wiring, only the plan already sitting on `workspaces.plan`. `count`
 * is members plus invites still pending, so five invites sent at once cannot
 * out-run two accepts.
 */
export function isMemberLimitReached(plan: Plan, count: number): boolean {
  return plan === "free" && count >= FREE_LIMITS.members;
}

/**
 * Whether one more lead would break the Free ceiling. A downgraded workspace
 * that already holds more than the ceiling keeps every row — this only blocks
 * the next insert.
 */
export function isLeadLimitReached(plan: Plan, count: number): boolean {
  return plan === "free" && count >= FREE_LIMITS.leads;
}

/**
 * Stripe subscription statuses that keep a workspace on Pro. `past_due` stays
 * in on purpose: Stripe retries the card for days, and cutting the workspace
 * off on the first failed charge would punish a customer whose card simply
 * expired. If the retries run out Stripe moves the subscription to `canceled`
 * or `unpaid`, and the workspace falls back to Free then.
 */
const PRO_STATUSES = new Set(["active", "trialing", "past_due"]);

export function planFromSubscriptionStatus(status: string | null): Plan {
  return status !== null && PRO_STATUSES.has(status) ? "pro" : "free";
}

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
