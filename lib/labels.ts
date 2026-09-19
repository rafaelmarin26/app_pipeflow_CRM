import type {
  ActivityType,
  DealStage,
  LeadStatus,
  MemberRole,
  Plan,
} from "@/types/database";

/**
 * Every PT-BR string the UI shows for a database enum lives here — CLAUDE.md §6.
 * Labels never live in the database: renaming a Kanban column has to be an edit
 * to this file, not a migration.
 */

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  new: "Novo Lead",
  contacted: "Contato Realizado",
  proposal: "Proposta Enviada",
  negotiation: "Negociação",
  won: "Fechado Ganho",
  lost: "Fechado Perdido",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  qualified: "Qualificado",
  unqualified: "Desqualificado",
  customer: "Cliente",
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  note: "Nota",
};

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  admin: "Admin",
  member: "Membro",
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Grátis",
  pro: "Pro",
};

/** Board column order. Matches the enum declaration order in the database. */
export const DEAL_STAGES: readonly DealStage[] = [
  "new",
  "contacted",
  "proposal",
  "negotiation",
  "won",
  "lost",
] as const;

export const LEAD_STATUSES: readonly LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
  "customer",
] as const;

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "call",
  "email",
  "meeting",
  "note",
] as const;

/**
 * Where a stage sits in the funnel. `open` stages are still in play; `won` and
 * `lost` are terminal. Components derive colour from this, never from the stage
 * name, so green and red stay exclusive to closed deals (CLAUDE.md §7).
 */
export type StageTone = "open" | "won" | "lost";

export function stageTone(stage: DealStage): StageTone {
  if (stage === "won") return "won";
  if (stage === "lost") return "lost";
  return "open";
}

export function isClosedStage(stage: DealStage): boolean {
  return stage === "won" || stage === "lost";
}

/** Options ready for a `<Select>`, in board order. */
export const dealStageOptions = DEAL_STAGES.map((value) => ({
  value,
  label: DEAL_STAGE_LABELS[value],
}));

export const leadStatusOptions = LEAD_STATUSES.map((value) => ({
  value,
  label: LEAD_STATUS_LABELS[value],
}));

export const activityTypeOptions = ACTIVITY_TYPES.map((value) => ({
  value,
  label: ACTIVITY_TYPE_LABELS[value],
}));
