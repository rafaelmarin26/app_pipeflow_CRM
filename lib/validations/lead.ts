import { z } from "zod";

import { Constants } from "@/types/database";

/**
 * Lead schema — PLAN.md M6.
 *
 * Same object validates the dialog in the browser today and the Server Action of
 * M12 tomorrow, so the PT-BR message the user reads lives next to the rule that
 * produced it (CLAUDE.md §6).
 *
 * Optional columns are modelled as empty strings rather than `null` because that
 * is what an untouched `<input>` submits. `leadInputToRow()` at the bottom does
 * the one translation to the nullable column.
 */

const optionalText = (max: number) =>
  z.string().trim().max(max, `Use no máximo ${max} caracteres.`);

export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do lead.")
    .max(120, "Use no máximo 120 caracteres."),

  // Empty is allowed — a lead captured by phone may not have an e-mail yet —
  // but anything typed has to be a real address.
  email: z.union([
    z.literal(""),
    z.email("Informe um e-mail válido.").max(160, "E-mail muito longo."),
  ]),

  phone: optionalText(24).refine(
    (value) => value === "" || value.replace(/\D/g, "").length >= 10,
    "Informe o telefone com DDD.",
  ),

  company: optionalText(120),
  job_title: optionalText(120),

  status: z.enum(Constants.public.Enums.lead_status),

  owner_id: z.string().min(1, "Selecione um responsável."),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Empty string is how a form says "no value"; the column says `null`. */
function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Form values as the `leads` table wants them. M12 calls this inside the Server
 * Action, right before the insert.
 */
export function leadInputToRow(input: LeadInput) {
  return {
    name: input.name.trim(),
    email: nullable(input.email),
    phone: nullable(input.phone),
    company: nullable(input.company),
    job_title: nullable(input.job_title),
    status: input.status,
    owner_id: input.owner_id,
  };
}
