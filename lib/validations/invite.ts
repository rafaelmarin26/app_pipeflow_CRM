import { z } from "zod";

import { Constants } from "@/types/database";

/**
 * Invite schema — PLAN.md M15. Same object validates the dialog in the
 * browser and the `inviteMember` Server Action, per CLAUDE.md §6.
 */
export const inviteSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail da pessoa convidada.")
    .pipe(z.email("Informe um e-mail válido.")),
  role: z.enum(Constants.public.Enums.member_role),
});

export type InviteInput = z.infer<typeof inviteSchema>;
