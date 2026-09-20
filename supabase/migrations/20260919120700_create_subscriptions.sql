-- Read-only from the client on purpose: plan state is only ever written by
-- the Stripe webhook under the service role key (CLAUDE.md §5), never by an
-- authenticated member — so there is no insert/update/delete policy here.

create table public.subscriptions (
  workspace_id uuid primary key references public.workspaces (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamptz
);

alter table public.subscriptions enable row level security;

create policy "Members can view their workspace subscription"
  on public.subscriptions for select
  to authenticated
  using (public.is_workspace_member(workspace_id));
