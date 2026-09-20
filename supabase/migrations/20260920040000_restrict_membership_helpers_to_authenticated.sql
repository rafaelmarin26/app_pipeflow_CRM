-- Same gap as 20260920030000, found by re-reading is_workspace_member() and
-- is_workspace_admin() against the Supabase security checklist: Postgres
-- grants EXECUTE on every new function to PUBLIC by default, and Supabase
-- additionally grants EXECUTE directly to `anon`/`authenticated` on creation
-- — so a `security definer` function in `public` is a public API endpoint
-- the moment it exists, regardless of whether any policy calls it.
--
-- Neither function leaks anything to an anonymous caller today: their
-- `(select auth.uid())` resolves to null outside a session, so
-- `user_id = null` never matches and both simply return false. This
-- migration closes the gap anyway, for the same reason 20260920030000
-- closed it for create_workspace_with_owner() — a function that does not
-- need to be public should not stay reachable by accident. `authenticated`
-- still needs EXECUTE: every RLS policy that calls these runs as the
-- connecting role, which must be allowed to invoke them.

revoke execute on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;

revoke execute on function public.is_workspace_admin(uuid) from public, anon;
grant execute on function public.is_workspace_admin(uuid) to authenticated;
