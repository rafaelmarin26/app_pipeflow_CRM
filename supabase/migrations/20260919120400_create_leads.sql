-- Any workspace member can operate on leads (PRD: Membro opera leads e
-- negócios livremente) — there is no owner-only restriction here.

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  job_title text,
  status public.lead_status not null default 'new',
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index leads_workspace_id_idx on public.leads (workspace_id);
create index leads_owner_id_idx on public.leads (owner_id);

alter table public.leads enable row level security;

create policy "Members can view workspace leads"
  on public.leads for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Members can create workspace leads"
  on public.leads for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Members can update workspace leads"
  on public.leads for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can delete workspace leads"
  on public.leads for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));
