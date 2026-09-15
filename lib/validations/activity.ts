import { z } from "zod";

import { Constants } from "@/types/database";

/**
 * Activity schema — PLAN.md M6. The author and the timestamp are not here on
 * purpose: `author_id` comes from the authenticated user and `occurred_at`
 * defaults in the database, both decided on the server in M12. A form that could
 * set them would be a form that could lie about who did what.
 */
export const activitySchema = z.object({
  type: z.enum(Constants.public.Enums.activity_type),
  description: z
    .string()
    .trim()
    .min(1, "Descreva o que aconteceu.")
    .max(2000, "Use no máximo 2000 caracteres."),
});

export type ActivityInput = z.infer<typeof activitySchema>;
