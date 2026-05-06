-- Listing media + Stripe Connect account scaffolding
create table if not exists public.listing_assets (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  asset_type text not null check (asset_type in ('image', 'video')),
  storage_path text not null,
  public_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.seller_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_account_id text unique,
  onboarding_complete boolean not null default false,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_seller_payout_accounts_updated_at on public.seller_payout_accounts;
create trigger set_seller_payout_accounts_updated_at
before update on public.seller_payout_accounts
for each row
execute function public.set_updated_at();

alter table public.listing_assets enable row level security;
alter table public.seller_payout_accounts enable row level security;

drop policy if exists "listing_assets_select_for_visible_listings" on public.listing_assets;
create policy "listing_assets_select_for_visible_listings"
on public.listing_assets
for select
to authenticated, anon
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_assets.listing_id
      and (
        l.status = 'active'
        or l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "listing_assets_insert_owner_or_admin" on public.listing_assets;
create policy "listing_assets_insert_owner_or_admin"
on public.listing_assets
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    public.get_my_role() in ('seller', 'admin')
    or public.get_my_role() = 'admin'
  )
);

drop policy if exists "listing_assets_update_owner_or_admin" on public.listing_assets;
create policy "listing_assets_update_owner_or_admin"
on public.listing_assets
for update
to authenticated
using (owner_id = auth.uid() or public.get_my_role() = 'admin')
with check (owner_id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "payout_accounts_select_self_or_admin" on public.seller_payout_accounts;
create policy "payout_accounts_select_self_or_admin"
on public.seller_payout_accounts
for select
to authenticated
using (seller_id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "payout_accounts_insert_self_or_admin" on public.seller_payout_accounts;
create policy "payout_accounts_insert_self_or_admin"
on public.seller_payout_accounts
for insert
to authenticated
with check (seller_id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "payout_accounts_update_self_or_admin" on public.seller_payout_accounts;
create policy "payout_accounts_update_self_or_admin"
on public.seller_payout_accounts
for update
to authenticated
using (seller_id = auth.uid() or public.get_my_role() = 'admin')
with check (seller_id = auth.uid() or public.get_my_role() = 'admin');
