-- The accept-invite screen (PLAN.md M15) shows who sent the invite, which the
-- M10 table never captured. `on delete set null` because losing the inviter's
-- account should not retroactively invalidate an otherwise-valid invite.

alter table public.invites
  add column invited_by uuid references public.profiles (id) on delete set null;
