-- Pre-deploy security audit (PLAN.md M17) found two SECURITY DEFINER functions
-- still reachable through PostgREST RPC that should not be:
--
-- 1. create_workspace_with_owner() — migration 20260920030000 already revokes
--    EXECUTE from public/anon for this function, but the live production
--    project never actually had that migration applied (confirmed via the
--    Supabase advisors: anon could still call
--    /rest/v1/rpc/create_workspace_with_owner). Re-stating the same revoke
--    here is idempotent and closes the gap for real this time.
-- 2. handle_user_profile_sync() — a trigger-only function for
--    on_auth_user_created_or_updated (see 20260920050000_create_profiles.sql).
--    Supabase grants EXECUTE on every new function to anon/authenticated by
--    default, but a trigger never needs role-level EXECUTE to fire — the
--    engine invokes it directly as part of firing the trigger. Exposing it
--    over /rest/v1/rpc/handle_user_profile_sync serves no purpose and widens
--    the attack surface for no reason.

revoke execute on function public.create_workspace_with_owner(text, text) from public, anon;
grant execute on function public.create_workspace_with_owner(text, text) to authenticated;

revoke execute on function public.handle_user_profile_sync() from public, anon, authenticated;
