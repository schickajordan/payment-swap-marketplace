-- Lightweight reputation surface (SEO + trust). Public read avoids profile table joins (RLS-safe for anon PDP).
create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_display_name text not null,
  reviewer_company text,
  rating integer not null check (rating between 1 and 5),
  headline text,
  body text not null,
  is_verified_trade boolean not null default false,
  created_at timestamptz not null default now(),
  constraint listing_reviews_one_per_buyer_per_listing unique (listing_id, reviewer_id)
);

create index if not exists listing_reviews_listing_created_idx
  on public.listing_reviews (listing_id, created_at desc);

alter table public.listing_reviews enable row level security;

drop policy if exists "listing_reviews_select_active_listings" on public.listing_reviews;
create policy "listing_reviews_select_active_listings"
on public.listing_reviews
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.listings l
    where l.id = listing_reviews.listing_id
      and l.status = 'active'
  )
);

drop policy if exists "listing_reviews_insert_qualified_buyer" on public.listing_reviews;
create policy "listing_reviews_insert_qualified_buyer"
on public.listing_reviews
for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and exists (
    select 1
    from public.listings l
    where l.id = listing_reviews.listing_id
      and l.status = 'active'
      and l.seller_id <> auth.uid()
  )
  and exists (
    select 1
    from public.payment_agreements a
    where a.listing_id = listing_reviews.listing_id
      and a.buyer_id = auth.uid()
      and a.status in ('signed', 'active', 'completed')
  )
);
