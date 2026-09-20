-- Repoints leads.owner_id, deals.owner_id, activities.author_id and
-- workspace_members.user_id from auth.users to public.profiles. Referential
-- integrity is unchanged — profiles.id is itself a 1:1 FK onto
-- auth.users(id), backfilled for every existing row by the previous
-- migration — but PostgREST can now resolve `owner:owner_id(...)` and
-- `author:author_id(...)` embeds, which is the exact join shape
-- types/views.ts and the M13 comments in
-- components/pipeline/pipeline-board.tsx already assumed. The
-- workspace_members repoint is what lets the owners/assignees dropdown on
-- the lead and deal dialogs read `select role, profile:user_id(...)` for
-- the whole roster in one query, instead of one per member.

alter table public.workspace_members
  drop constraint workspace_members_user_id_fkey,
  add constraint workspace_members_user_id_fkey
    foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.leads
  drop constraint leads_owner_id_fkey,
  add constraint leads_owner_id_fkey
    foreign key (owner_id) references public.profiles (id) on delete set null;

alter table public.deals
  drop constraint deals_owner_id_fkey,
  add constraint deals_owner_id_fkey
    foreign key (owner_id) references public.profiles (id) on delete set null;

alter table public.activities
  drop constraint activities_author_id_fkey,
  add constraint activities_author_id_fkey
    foreign key (author_id) references public.profiles (id) on delete set null;
