-- Fixes a real gap found by probing the live REST API: Supabase grants
-- EXECUTE on every newly created function directly to the `anon` and
-- `authenticated` roles, independent of the PUBLIC grant. The previous
-- migration only revoked from PUBLIC, so `anon` could still call
-- create_workspace_with_owner() — confirmed live, the call reached the
-- first insert and only failed on the owner_id not-null constraint (no
-- orphan row: the function body is one transaction, so the failure rolled
-- it back). Revoking from `anon` explicitly closes that path for good.

revoke execute on function public.create_workspace_with_owner(text, text) from public, anon;
grant execute on function public.create_workspace_with_owner(text, text) to authenticated;
