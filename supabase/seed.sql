-- Local-only fixtures for the M10 isolation test: two workspaces, each with
-- an Admin and a Member, and a few leads/deals/activities in each.
--
-- Only runs via `npx supabase db reset` against the local stack — Supabase
-- never applies seed.sql to a remote project, so this never touches
-- production or staging data.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin.a@pipeflow.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'member.a@pipeflow.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'admin.b@pipeflow.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'member.b@pipeflow.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}');

insert into public.workspaces (id, name, slug, owner_id) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Workspace A', 'workspace-a', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Workspace B', 'workspace-b', '33333333-3333-3333-3333-333333333333');

insert into public.workspace_members (workspace_id, user_id, role) values
  ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'admin'),
  ('aaaaaaaa-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'member'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'admin'),
  ('bbbbbbbb-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'member');

insert into public.leads (id, workspace_id, name, email, company, status, owner_id) values
  ('cccccccc-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Lead A1', 'lead.a1@example.com', 'Empresa A1', 'new', '11111111-1111-1111-1111-111111111111'),
  ('cccccccc-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Lead A2', 'lead.a2@example.com', 'Empresa A2', 'contacted', '22222222-2222-2222-2222-222222222222'),
  ('dddddddd-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'Lead B1', 'lead.b1@example.com', 'Empresa B1', 'new', '33333333-3333-3333-3333-333333333333');

insert into public.deals (workspace_id, lead_id, title, value_cents, stage, position, owner_id, due_date) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'Negócio A1', 500000, 'new', 1, '11111111-1111-1111-1111-111111111111', current_date + 7),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000002', 'Negócio A2', 750000, 'proposal', 1, '22222222-2222-2222-2222-222222222222', current_date + 14),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', 'Negócio B1', 300000, 'new', 1, '33333333-3333-3333-3333-333333333333', current_date + 5);

insert into public.activities (workspace_id, lead_id, author_id, type, description) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'note', 'Primeiro contato registrado.'),
  ('bbbbbbbb-0000-0000-0000-000000000001', 'dddddddd-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'call', 'Ligação inicial realizada.');
