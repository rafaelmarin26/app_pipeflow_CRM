-- Membership helper functions and the policies that depend on them.
--
-- Both helpers are `security definer` so that checking membership never
-- re-enters the RLS-protected workspace_members table from inside its own
-- policy (CLAUDE.md §5: querying workspace_members directly from that
-- table's policy causes infinite recursion).

create function public.is_workspace_member(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = (select auth.uid())
  );
$$;

create function public.is_workspace_admin(ws uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- Atomic creation of a workspace plus its founding admin membership.
-- Runs as security definer on purpose: the workspace_members insert policy
-- below requires the caller to already be a member of the workspace, so the
-- very first row of a brand new workspace can never satisfy it from a plain
-- client insert. This function is the only path onto that first row — the
-- onboarding and "create another workspace" Server Actions call it via RPC.
create function public.create_workspace_with_owner(workspace_name text, workspace_slug text)
returns public.workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace public.workspaces;
begin
  insert into public.workspaces (name, slug, owner_id)
  values (workspace_name, workspace_slug, auth.uid())
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, auth.uid(), 'admin');

  return new_workspace;
end;
$$;

revoke execute on function public.create_workspace_with_owner(text, text) from public;
grant execute on function public.create_workspace_with_owner(text, text) to authenticated;

-- workspaces: no insert policy — creation only happens through the
-- security-definer function above, never through a direct client insert.

create policy "Members can view their workspaces"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

create policy "Admins can update their workspace"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy "Admins can delete their workspace"
  on public.workspaces for delete
  to authenticated
  using (public.is_workspace_admin(id));

-- workspace_members: no insert policy either — the founding admin row comes
-- from create_workspace_with_owner(), and invite acceptance runs under the
-- service role key (CLAUDE.md §5), both of which bypass RLS entirely.

create policy "Members can view their workspace roster"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Admins can change member roles"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "Admins can remove members, or a member can leave"
  on public.workspace_members for delete
  to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or user_id = (select auth.uid())
  );
