import type { SupabaseClient } from "@supabase/supabase-js";

import { FREE_LIMITS } from "@/lib/stripe/plans";
import type { Database, Workspace } from "@/types/database";

type Supabase = SupabaseClient<Database>;
type WorkspaceRef = Pick<Workspace, "id" | "plan">;

/**
 * Result of a plan-limit check — CLAUDE.md §5. `message` is PT-BR, ready to
 * hand to the UI or return from a Server Action as `{ error }`; it is null
 * whenever the action is allowed. `limit` is null on Pro, which has none.
 */
export type LimitCheck = {
  allowed: boolean;
  used: number;
  limit: number | null;
  message: string | null;
};

const UNLIMITED: LimitCheck = { allowed: true, used: 0, limit: null, message: null };

/**
 * Whether the workspace can take one more lead. Counts before the caller
 * inserts, so the UI is never the only thing standing between a Free
 * workspace and lead 51. A workspace downgraded from Pro that already holds
 * more than the ceiling keeps every row: this only refuses the next insert.
 *
 * Two concurrent creations at the ceiling can both pass, since count-then-insert
 * is not atomic; closing that would take a database trigger.
 */
export async function canAddLead(
  supabase: Supabase,
  workspace: WorkspaceRef,
): Promise<LimitCheck> {
  if (workspace.plan === "pro") return UNLIMITED;

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const used = count ?? 0;
  const allowed = used < FREE_LIMITS.leads;

  return {
    allowed,
    used,
    limit: FREE_LIMITS.leads,
    message: allowed
      ? null
      : `O plano Grátis permite até ${FREE_LIMITS.leads} leads. Faça upgrade para o Pro em Configurações › Plano para cadastrar mais.`,
  };
}

/**
 * Whether the workspace can take one more collaborator. `used` is members plus
 * invites still pending, so five invites sent at once cannot out-run two
 * accepts: an open invite already holds a seat.
 */
export async function canAddMember(
  supabase: Supabase,
  workspace: WorkspaceRef,
): Promise<LimitCheck> {
  if (workspace.plan === "pro") return UNLIMITED;

  const [{ count: members }, { count: pending }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("user_id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id),
    supabase
      .from("invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspace.id)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString()),
  ]);

  const used = (members ?? 0) + (pending ?? 0);
  const allowed = used < FREE_LIMITS.members;

  return {
    allowed,
    used,
    limit: FREE_LIMITS.members,
    message: allowed
      ? null
      : `O plano Grátis permite até ${FREE_LIMITS.members} colaboradores. Faça upgrade para o Pro em Configurações › Plano para convidar mais gente.`,
  };
}
