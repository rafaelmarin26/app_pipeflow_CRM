import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Bypasses RLS entirely — CLAUDE.md §5: only for a Server Action where RLS
 * needs to be worked around on purpose, and only ever imported server side.
 *
 * The one caller today is invite acceptance (PLAN.md M15): the visitor is not
 * yet a `workspace_members` row when they read the invite or accept it, so no
 * policy on `invites` or `workspace_members` would ever let a plain client
 * through. No cookies here on purpose — this client carries no user session,
 * only the service role's own.
 */
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
