-- value_cents is bigint (never float — CLAUDE.md §4) and position is
-- numeric so a card can be inserted between two others without rewriting
-- the whole column (rank-based ordering for the M13 kanban persistence).

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  title text not null,
  value_cents bigint not null default 0,
  stage public.deal_stage not null default 'new',
  position numeric not null default 0,
  owner_id uuid references auth.users (id) on delete set null,
  due_date date,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index deals_workspace_id_idx on public.deals (workspace_id);
create index deals_lead_id_idx on public.deals (lead_id);
create index deals_owner_id_idx on public.deals (owner_id);

alter table public.deals enable row level security;

create policy "Members can view workspace deals"
  on public.deals for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Members can create workspace deals"
  on public.deals for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Members can update workspace deals"
  on public.deals for update
  to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can delete workspace deals"
  on public.deals for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));
