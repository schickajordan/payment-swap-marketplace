-- BI-friendly north-star milestones (GEO|category cells, idempotent dedupe keys)
create table if not exists public.liquidity_milestones (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  liquidity_cell text not null,
  listing_id uuid references public.listings(id) on delete set null,
  agreement_id uuid references public.payment_agreements(id) on delete set null,
  agreement_payment_id uuid references public.agreement_payments(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  dedupe_key text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint liquidity_milestones_dedupe_key unique (dedupe_key)
);

create index if not exists liquidity_milestones_cell_created_idx
  on public.liquidity_milestones (liquidity_cell, created_at desc);

create index if not exists liquidity_milestones_event_type_idx
  on public.liquidity_milestones (event_type);

alter table public.liquidity_milestones enable row level security;

drop policy if exists "liquidity_milestones_admin_select" on public.liquidity_milestones;
create policy "liquidity_milestones_admin_select"
on public.liquidity_milestones
for select
to authenticated
using (public.get_my_role() = 'admin');

drop policy if exists "liquidity_milestones_admin_insert" on public.liquidity_milestones;
create policy "liquidity_milestones_admin_insert"
on public.liquidity_milestones
for insert
to authenticated
with check (public.get_my_role() = 'admin');
