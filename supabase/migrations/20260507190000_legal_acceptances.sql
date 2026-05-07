create table if not exists public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  doc_type text not null check (doc_type in ('terms', 'privacy')),
  document_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'web'
);

create index if not exists legal_acceptances_profile_doc_idx
  on public.legal_acceptances (profile_id, doc_type, accepted_at desc);

alter table public.legal_acceptances enable row level security;

drop policy if exists "legal_acceptances_select_own" on public.legal_acceptances;
create policy "legal_acceptances_select_own"
on public.legal_acceptances
for select
using (auth.uid() = profile_id);

drop policy if exists "legal_acceptances_insert_own" on public.legal_acceptances;
create policy "legal_acceptances_insert_own"
on public.legal_acceptances
for insert
with check (auth.uid() = profile_id);
