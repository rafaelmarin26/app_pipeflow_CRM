-- Workspace domain: the tenancy root. RLS is enabled here, in the same
-- migration that creates the tables (CLAUDE.md §5), but policies land in the
-- next migration once is_workspace_member()/is_workspace_admin() exist —
-- until then both tables deny all access by default, which is the safe state.

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users (id) on delete restrict,
  plan public.plan not null default 'free',
  created_at timestamptz not null default now()
);

create index workspaces_owner_id_idx on public.workspaces (owner_id);

alter table public.workspaces enable row level security;

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.member_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- The composite PK already indexes workspace_id as its leading column;
-- user_id needs its own index for "which workspaces does this user belong
-- to" lookups and for is_workspace_member()/is_workspace_admin() below.
create index workspace_members_user_id_idx on public.workspace_members (user_id);

alter table public.workspace_members enable row level security;
