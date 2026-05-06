-- Payment Swap Marketplace core schema + RLS
create extension if not exists "pgcrypto";

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.listing_status as enum ('draft', 'pending_review', 'active', 'paused', 'closed', 'flagged');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.agreement_status as enum ('draft', 'signed', 'active', 'defaulted', 'completed', 'cancelled');
create type public.payment_status as enum ('scheduled', 'processing', 'paid', 'late', 'failed');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'buyer',
  full_name text,
  company_name text,
  phone text,
  is_identity_verified boolean not null default false,
  is_business_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  make text,
  model text,
  model_year integer,
  serial_or_vin text not null,
  location_city text,
  location_state text,
  monthly_payment_cents integer not null check (monthly_payment_cents > 0),
  deposit_cents integer not null default 0 check (deposit_cents >= 0),
  buyout_price_cents integer check (buyout_price_cents >= 0),
  remaining_term_months integer,
  condition_rating text,
  status public.listing_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_checks (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete set null,
  status public.verification_status not null default 'pending',
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_agreements (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  status public.agreement_status not null default 'draft',
  start_date date,
  end_date date,
  monthly_payment_cents integer not null check (monthly_payment_cents > 0),
  escrow_enabled boolean not null default true,
  signed_contract_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_buyer_must_differ check (seller_id <> buyer_id)
);

create table if not exists public.agreement_payments (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.payment_agreements(id) on delete cascade,
  due_date date not null,
  amount_cents integer not null check (amount_cents > 0),
  status public.payment_status not null default 'scheduled',
  paid_at timestamptz,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

drop trigger if exists set_payment_agreements_updated_at on public.payment_agreements;
create trigger set_payment_agreements_updated_at
before update on public.payment_agreements
for each row
execute function public.set_updated_at();

create or replace function public.get_my_role()
returns public.user_role
language sql
stable
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'buyer'::public.user_role
  );
$$;

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.verification_checks enable row level security;
alter table public.payment_agreements enable row level security;
alter table public.agreement_payments enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.get_my_role() = 'admin')
with check (id = auth.uid() or public.get_my_role() = 'admin');

-- Listings policies
drop policy if exists "listings_select_public_or_owner_or_admin" on public.listings;
create policy "listings_select_public_or_owner_or_admin"
on public.listings
for select
to authenticated
using (
  status = 'active'
  or seller_id = auth.uid()
  or public.get_my_role() = 'admin'
);

drop policy if exists "listings_insert_seller_or_admin" on public.listings;
create policy "listings_insert_seller_or_admin"
on public.listings
for insert
to authenticated
with check (
  seller_id = auth.uid()
  and public.get_my_role() in ('seller', 'admin')
);

drop policy if exists "listings_update_owner_or_admin" on public.listings;
create policy "listings_update_owner_or_admin"
on public.listings
for update
to authenticated
using (seller_id = auth.uid() or public.get_my_role() = 'admin')
with check (seller_id = auth.uid() or public.get_my_role() = 'admin');

-- Verification policies
drop policy if exists "verification_select_related_or_admin" on public.verification_checks;
create policy "verification_select_related_or_admin"
on public.verification_checks
for select
to authenticated
using (
  public.get_my_role() = 'admin'
  or exists (
    select 1
    from public.listings l
    where l.id = verification_checks.listing_id
      and l.seller_id = auth.uid()
  )
);

drop policy if exists "verification_admin_write" on public.verification_checks;
create policy "verification_admin_write"
on public.verification_checks
for all
to authenticated
using (public.get_my_role() = 'admin')
with check (public.get_my_role() = 'admin');

-- Agreements policies
drop policy if exists "agreements_select_participant_or_admin" on public.payment_agreements;
create policy "agreements_select_participant_or_admin"
on public.payment_agreements
for select
to authenticated
using (
  seller_id = auth.uid()
  or buyer_id = auth.uid()
  or public.get_my_role() = 'admin'
);

drop policy if exists "agreements_insert_seller_or_admin" on public.payment_agreements;
create policy "agreements_insert_seller_or_admin"
on public.payment_agreements
for insert
to authenticated
with check (
  seller_id = auth.uid()
  or public.get_my_role() = 'admin'
);

drop policy if exists "agreements_update_participant_or_admin" on public.payment_agreements;
create policy "agreements_update_participant_or_admin"
on public.payment_agreements
for update
to authenticated
using (
  seller_id = auth.uid()
  or buyer_id = auth.uid()
  or public.get_my_role() = 'admin'
)
with check (
  seller_id = auth.uid()
  or buyer_id = auth.uid()
  or public.get_my_role() = 'admin'
);

-- Agreement payments policies
drop policy if exists "agreement_payments_select_participant_or_admin" on public.agreement_payments;
create policy "agreement_payments_select_participant_or_admin"
on public.agreement_payments
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_agreements a
    where a.id = agreement_payments.agreement_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "agreement_payments_mutation_admin_or_seller" on public.agreement_payments;
create policy "agreement_payments_mutation_admin_or_seller"
on public.agreement_payments
for all
to authenticated
using (
  exists (
    select 1
    from public.payment_agreements a
    where a.id = agreement_payments.agreement_id
      and (
        a.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
)
with check (
  exists (
    select 1
    from public.payment_agreements a
    where a.id = agreement_payments.agreement_id
      and (
        a.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);
