-- Audit trail for the Stripe webhook: which workspace an event touched and
-- who started the checkout, both read from the metadata the checkout action
-- writes. Nullable — events the app did not originate, and subscriptions
-- created before user_id was added to the metadata, carry neither.
alter table public.stripe_events
  add column workspace_id uuid references public.workspaces (id) on delete set null,
  add column user_id uuid references public.profiles (id) on delete set null;

create index stripe_events_workspace_id_idx on public.stripe_events (workspace_id);
create index stripe_events_user_id_idx on public.stripe_events (user_id);
