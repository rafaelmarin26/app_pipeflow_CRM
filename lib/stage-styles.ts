import type { DealStage } from "@/types/database";

/**
 * One colour per pipeline stage — CLAUDE.md §7, Identidade Visual v2.
 *
 * This replaces the three-tone scheme of v1, where every open stage shared the
 * brand colour and only won and lost were allowed a hue of their own. v2 maps
 * `deal_stage` one-to-one onto six colours, cool at the top of the funnel and
 * warming toward the close, so a card's stage is legible before its text is.
 *
 * The maps live here rather than inside a component because the badge, the
 * column header and the card all have to agree: a stage that is orange on the
 * board cannot be amber on the lead detail page. Class *fragments* are listed
 * in full rather than composed at runtime — Tailwind scans source text, and a
 * class it never sees spelled out is a class it never generates.
 */

/** Full tone: dots, rails, fills, the accent edge of a card. */
export const STAGE_BG: Record<DealStage, string> = {
  new: "bg-stage-new",
  contacted: "bg-stage-contacted",
  proposal: "bg-stage-proposal",
  negotiation: "bg-stage-negotiation",
  won: "bg-stage-won",
  lost: "bg-stage-lost",
};

/**
 * The same tone as text. Safe at any size in this palette: each of the six
 * clears WCAG AA on `--surface` and on a 10% tint of itself, which is why v2
 * has no separate "ink" scale the way v1 needed.
 */
export const STAGE_TEXT: Record<DealStage, string> = {
  new: "text-stage-new",
  contacted: "text-stage-contacted",
  proposal: "text-stage-proposal",
  negotiation: "text-stage-negotiation",
  won: "text-stage-won",
  lost: "text-stage-lost",
};

/** Badge and chip surface: a 10% tint under text of the same tone. */
export const STAGE_TINT: Record<DealStage, string> = {
  new: "bg-stage-new/10",
  contacted: "bg-stage-contacted/10",
  proposal: "bg-stage-proposal/10",
  negotiation: "bg-stage-negotiation/10",
  won: "bg-stage-won/10",
  lost: "bg-stage-lost/10",
};

export const STAGE_BORDER: Record<DealStage, string> = {
  new: "border-stage-new/25",
  contacted: "border-stage-contacted/25",
  proposal: "border-stage-proposal/25",
  negotiation: "border-stage-negotiation/25",
  won: "border-stage-won/25",
  lost: "border-stage-lost/25",
};

/** Drop target: the column a card is currently hovering over. */
export const STAGE_RING: Record<DealStage, string> = {
  new: "ring-stage-new/40",
  contacted: "ring-stage-contacted/40",
  proposal: "ring-stage-proposal/40",
  negotiation: "ring-stage-negotiation/40",
  won: "ring-stage-won/40",
  lost: "ring-stage-lost/40",
};

/** Card hover: the border picks up the stage it belongs to. */
export const STAGE_HOVER_BORDER: Record<DealStage, string> = {
  new: "hover:border-stage-new/40",
  contacted: "hover:border-stage-contacted/40",
  proposal: "hover:border-stage-proposal/40",
  negotiation: "hover:border-stage-negotiation/40",
  won: "hover:border-stage-won/40",
  lost: "hover:border-stage-lost/40",
};

/**
 * The same six tones as raw CSS values, for the places a Tailwind class cannot
 * reach: SVG `fill` attributes inside Recharts, which paints into a chart it
 * owns and never sees our class names.
 *
 * Pointing at the custom properties rather than repeating the hexes is what
 * keeps the funnel bar and the Kanban column the same colour after a palette
 * tweak — there is still exactly one place where `#5B7FFF` is written down.
 */
export const STAGE_COLOR: Record<DealStage, string> = {
  new: "var(--stage-new)",
  contacted: "var(--stage-contacted)",
  proposal: "var(--stage-proposal)",
  negotiation: "var(--stage-negotiation)",
  won: "var(--stage-won)",
  lost: "var(--stage-lost)",
};
