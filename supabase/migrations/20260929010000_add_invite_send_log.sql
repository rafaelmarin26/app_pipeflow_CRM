-- Anti-abuse rate limit for invite e-mails — PLAN.md M17, "Rate limit no envio
-- de convites". `invites` alone cannot answer "how many sends happened
-- recently": cancelling and recreating an invite deletes its row, so an Admin
-- looping invite -> cancel -> invite would reset any count based on it. This
-- table is append-only from the app's side (Server Actions insert, never
-- update or delete), so the count survives that loop.
--
-- On the Free plan the 2-collaborator ceiling already bounds this, but Pro
-- has no member cap — without this, a Pro Admin (or a compromised Admin
-- session) could use the app's Resend account to blast e-mail at arbitrary
-- addresses with no limit at all.
create table public.invite_send_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index invite_send_log_workspace_id_created_at_idx
  on public.invite_send_log (workspace_id, created_at);

alter table public.invite_send_log enable row level security;

-- Only an Admin of the workspace can log or read its own send history — the
-- rate-limit check in `lib/limits.ts` runs as the authenticated user, not the
-- service role, so it needs both directions.
create policy "Admins can view their workspace invite send log"
  on public.invite_send_log for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "Admins can log invite sends"
  on public.invite_send_log for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));
