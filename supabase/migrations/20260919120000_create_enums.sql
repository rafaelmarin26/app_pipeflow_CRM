-- Domain enums shared across the schema (CLAUDE.md §4).

create type public.member_role as enum ('admin', 'member');
create type public.plan as enum ('free', 'pro');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'unqualified', 'customer');
create type public.activity_type as enum ('call', 'email', 'meeting', 'note');
create type public.deal_stage as enum ('new', 'contacted', 'proposal', 'negotiation', 'won', 'lost');
