-- PLAN.md M16 — billing storage.
--
-- 1. stripe_events: one row per Stripe event already claimed by the webhook,
--    so a redelivery hits the primary key instead of being processed twice
--    (CLAUDE.md §5). Written only by the service role, which bypasses RLS —
--    RLS is enabled with no policy on purpose, so no client role can read or
--    write it.
create table public.stripe_events (
  event_id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

-- 2. The webhook resolves a workspace from the Stripe customer when a
--    subscription carries no workspace_id metadata. A customer belongs to at
--    most one workspace, so the index is unique.
create unique index subscriptions_stripe_customer_id_key
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index subscriptions_stripe_subscription_id_idx
  on public.subscriptions (stripe_subscription_id);

-- 3. Close the paywall bypass. "Admins can update their workspace" filters
--    rows, not columns, so any Admin could run
--    `update workspaces set plan = 'pro'` straight from the browser with the
--    anon key. Plan state is written only by the Stripe webhook under the
--    service role (CLAUDE.md §5), so authenticated users keep UPDATE on the
--    one column the Workspace tab actually edits and lose it everywhere else
--    (plan, owner_id, slug, created_at).
revoke update on public.workspaces from authenticated;
grant update (name) on public.workspaces to authenticated;
