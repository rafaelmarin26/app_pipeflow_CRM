-- `auth.users` is not part of the schema PostgREST exposes, so nothing can
-- embed it (`select *, owner:owner_id(...)`) the way `LeadWithOwner`,
-- `DealCardData` and `ActivityWithAuthor` (types/views.ts) need. `profiles`
-- mirrors just the display columns of `auth.users` into `public`, kept in
-- sync by the trigger below, so M12/M13 can join a lead's, a deal's or an
-- activity's owner the same way the mocks always pretended was possible.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A member can read the profile of anyone who shares at least one workspace
-- with them (their own profile included) — enough to resolve an owner or
-- author name without exposing the whole user base across workspaces.
create policy "Members can view profiles of shared workspace members"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.workspace_members mine
      join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
      where mine.user_id = (select auth.uid())
        and theirs.user_id = profiles.id
    )
  );

-- No insert/update/delete policy: every write to this table comes from the
-- trigger below, which runs security definer and so bypasses RLS entirely.

create function public.handle_user_profile_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), new.email, 'Usuário'),
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created_or_updated
  after insert or update of raw_user_meta_data, email on auth.users
  for each row execute function public.handle_user_profile_sync();

-- Backfill: users created before this migration (every account from the M11
-- testing rounds included) get their profile row retroactively, so the FK
-- repoint in the next migration never points owner_id at a missing row.
insert into public.profiles (id, name, email, avatar_url)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'name'), ''), email, 'Usuário'),
  coalesce(email, ''),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;
