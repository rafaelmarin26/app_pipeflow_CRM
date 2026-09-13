import { z } from "zod";

/**
 * Workspace schemas — first used by the M5 onboarding screen, reused in M15 when
 * the switcher gains "create another workspace".
 */
export const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Dê um nome ao seu workspace.")
    .min(2, "Use pelo menos 2 caracteres.")
    .max(60, "Use no máximo 60 caracteres."),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
