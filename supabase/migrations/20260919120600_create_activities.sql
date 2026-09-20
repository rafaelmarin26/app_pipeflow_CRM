-- Any workspace member can read and log activities, but editing or
-- deleting an existing entry is restricted to its author (or an Admin) —
-- the activity timeline is a log, not a shared scratchpad.

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  deal_id uuid references public.deals (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  type public.activity_type not null,
  description text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index activities_workspace_id_idx on public.activities (workspace_id);
create index activities_lead_id_idx on public.activities (lead_id);
create index activities_deal_id_idx on public.activities (deal_id);
create index activities_author_id_idx on public.activities (author_id);

alter table public.activities enable row level security;

create policy "Members can view workspace activities"
  on public.activities for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Members can log workspace activities"
  on public.activities for insert
  to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and author_id = (select auth.uid())
  );

create policy "Authors and admins can update activities"
  on public.activities for update
  to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id)
  )
  with check (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id)
  );

create policy "Authors and admins can delete activities"
  on public.activities for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id)
  );
