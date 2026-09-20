import { z } from "zod";

import { Constants } from "@/types/database";

/**
 * Deal schema — PLAN.md M7.
 *
 * Same object validates the dialog in the browser today and the Server Action of
 * M13 tomorrow, so the PT-BR message the user reads lives next to the rule that
 * produced it (CLAUDE.md §6).
 *
 * The one thing this schema does beyond checking is the money conversion: the
 * form hands over a BRL string ("1.480,00") and the column wants integer cents
 * (148000). Doing it here means the browser and the server round the same way —
 * a second parser on the backend would be a second place for a centavo to go
 * missing (CLAUDE.md §4).
 */

/**
 * `1.480,00`, `1480,00`, `1480.50` and `R$ 1.480` all mean the same thing to a
 * Brazilian typing in a hurry. Returns `null` when the text is not a number.
 */
export function parseBrlToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (cleaned === "") return null;

  let normalized: string;

  if (cleaned.includes(",")) {
    // A comma is unambiguous in pt-BR: it is the decimal mark, so every dot is
    // a thousands separator.
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    const lastDot = cleaned.lastIndexOf(".");
    const decimalDot = lastDot >= 0 && cleaned.length - lastDot === 3;
    // Without a comma, `1.480` is four digits and `1480.50` is a decimal. Two
    // digits after the final dot is the only reading that means centavos.
    normalized = decimalDot
      ? cleaned.replace(/\.(?=.*\.)/g, "")
      : cleaned.replace(/\./g, "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;

  return Math.round(value * 100);
}

/** Integer cents back into what the input should show: `148000` -> `1480,00`. */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const dealSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe um título com pelo menos 2 caracteres.")
    .max(140, "Use no máximo 140 caracteres."),

  // A string while the browser validates it ("1.480,00", straight off the
  // input) — but the Server Actions in M13's `pipeline/_actions.ts` run this
  // same schema a second time on `DealInput`, where `value` has already been
  // transformed to cents. Accepting both keeps `dealSchema` re-entrant, so
  // the server can validate its own values without a second, parallel schema
  // that only accepts numbers.
  value: z.union([z.string(), z.number()]).transform((raw, ctx) => {
    if (typeof raw === "number") {
      if (!Number.isFinite(raw) || raw < 0) {
        ctx.addIssue({ code: "custom", message: "O valor não pode ser negativo." });
        return z.NEVER;
      }
      return Math.round(raw);
    }

    const trimmed = raw.trim();
    if (trimmed === "") {
      ctx.addIssue({ code: "custom", message: "Informe o valor do negócio." });
      return z.NEVER;
    }

    const cents = parseBrlToCents(trimmed);
    if (cents === null) {
      ctx.addIssue({ code: "custom", message: "Informe um valor válido." });
      return z.NEVER;
    }
    if (cents < 0) {
      ctx.addIssue({ code: "custom", message: "O valor não pode ser negativo." });
      return z.NEVER;
    }

    return cents;
  }),

  // Optional on purpose: a deal can exist before anyone decides which contact it
  // belongs to. An untouched select submits "", which becomes `null` at the row.
  lead_id: z.string(),

  owner_id: z.string().min(1, "Selecione um responsável."),

  // `<input type="date">` always emits `yyyy-MM-dd` or "".
  due_date: z
    .string()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Informe uma data válida.",
    ),

  stage: z.enum(Constants.public.Enums.deal_stage),
});

/** What the inputs hold while the user types — money still a string. */
export type DealFormValues = z.input<typeof dealSchema>;

/** What a validated submit produces — money already in integer cents. */
export type DealInput = z.output<typeof dealSchema>;

/** Empty string is how a form says "no value"; the column says `null`. */
function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Form values as the `deals` table wants them. M13 calls this inside the Server
 * Action, right before the insert.
 */
export function dealInputToRow(input: DealInput) {
  return {
    title: input.title.trim(),
    value_cents: input.value,
    lead_id: nullable(input.lead_id),
    owner_id: nullable(input.owner_id),
    due_date: nullable(input.due_date),
    stage: input.stage,
  };
}
