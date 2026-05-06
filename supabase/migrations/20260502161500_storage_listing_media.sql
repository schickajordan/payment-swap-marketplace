-- Supabase Storage: public listing-media bucket tied to listings RLS-compatible paths
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-media',
  'listing-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing_assets_insert_owner_or_admin" on public.listing_assets;
drop policy if exists "listing_assets_insert_owned_listings" on public.listing_assets;

create policy "listing_assets_insert_owned_listings"
on public.listing_assets
for insert
to authenticated
with check (
  owner_id = (select l.seller_id from public.listings l where l.id = listing_assets.listing_id)
  and exists (
    select 1 from public.listings l
    where l.id = listing_assets.listing_id
      and (
        l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

-- Path convention: bucket listing-media → object key = `<listing_uuid>/<anything>`
drop policy if exists "listing_media_select" on storage.objects;
drop policy if exists "listing_media_select_anon" on storage.objects;
drop policy if exists "listing_media_select_auth" on storage.objects;

create policy "listing_media_select_anon"
on storage.objects for select to anon using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(storage.objects.name, '/', 1)
      and l.status = 'active'
  )
);

create policy "listing_media_select_auth"
on storage.objects for select to authenticated using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(storage.objects.name, '/', 1)
      and (
        l.status = 'active'
        or l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "listing_media_upload" on storage.objects;
create policy "listing_media_upload"
on storage.objects for insert to authenticated with check (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(storage.objects.name, '/', 1)
      and (
        l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "listing_media_update" on storage.objects;
create policy "listing_media_update"
on storage.objects for update to authenticated using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(storage.objects.name, '/', 1)
      and (
        l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "listing_media_delete" on storage.objects;
create policy "listing_media_delete"
on storage.objects for delete to authenticated using (
  bucket_id = 'listing-media'
  and exists (
    select 1 from public.listings l
    where l.id::text = split_part(storage.objects.name, '/', 1)
      and (
        l.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);
