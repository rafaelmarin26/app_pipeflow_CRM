-- Invite tokens are Admin-only to read/write from an authenticated session.
-- The public accept page (`convite/[token]`) looks up a token before the
-- visitor has any session at all, so that path reads/writes through the
-- service role key instead (CLAUDE.md §5) and never touches these policies.

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role public.member_role not null default 'member',
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (token)
);

create index invites_workspace_id_idx on public.invites (workspace_id);

alter table public.invites enable row level security;

create policy "Admins can view invites"
  on public.invites for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "Admins can create invites"
  on public.invites for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "Admins can update invites"
  on public.invites for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "Admins can cancel invites"
  on public.invites for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));
