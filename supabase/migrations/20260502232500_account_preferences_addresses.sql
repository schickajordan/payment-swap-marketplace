-- Account notification preferences + saved addresses (profiles & shipping-style contact book)

alter table public.profiles
  add column if not exists notify_email_transactions boolean not null default true;

alter table public.profiles
  add column if not exists notify_email_messages boolean not null default true;

alter table public.profiles
  add column if not exists notify_email_marketing boolean not null default false;

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid (),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Shipping',
  line1 text not null,
  line2 text,
  city text,
  region text,
  postal_code text,
  country_code text not null default 'US',
  is_default boolean not null default false,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

drop trigger if exists set_user_addresses_updated_at on public.user_addresses;

create trigger set_user_addresses_updated_at
before update on public.user_addresses
for each row
execute function public.set_updated_at ();

create index if not exists user_addresses_profile_id_idx on public.user_addresses (profile_id);

alter table public.user_addresses enable row level security;

drop policy if exists "user_addresses_select_own" on public.user_addresses;

create policy "user_addresses_select_own" on public.user_addresses for select to authenticated using (profile_id = auth.uid());

drop policy if exists "user_addresses_insert_own" on public.user_addresses;

create policy "user_addresses_insert_own" on public.user_addresses for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "user_addresses_update_own" on public.user_addresses;

create policy "user_addresses_update_own" on public.user_addresses for
update to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

drop policy if exists "user_addresses_delete_own" on public.user_addresses;

create policy "user_addresses_delete_own" on public.user_addresses for delete to authenticated using (profile_id = auth.uid());
