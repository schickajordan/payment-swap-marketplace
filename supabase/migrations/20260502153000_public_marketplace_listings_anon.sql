-- Allow unauthenticated browsing of published (active) listings for SEO/marketing pages.
drop policy if exists "listings_select_active_anon" on public.listings;
create policy "listings_select_active_anon"
on public.listings
for select
to anon
using (status = 'active');
