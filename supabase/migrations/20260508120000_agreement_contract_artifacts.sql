-- Private contract documents per payment agreement (vault). Admin uploads;
-- buyers/sellers read via signed URLs in the app; paths: `<agreement_uuid>/<object_key>`.

create table if not exists public.agreement_contract_artifacts (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.payment_agreements(id) on delete cascade,
  storage_path text not null unique,
  original_filename text not null,
  content_type text not null,
  label text,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists agreement_contract_artifacts_agreement_id_idx
  on public.agreement_contract_artifacts (agreement_id, created_at desc);

alter table public.agreement_contract_artifacts enable row level security;

drop policy if exists "agreement_contract_artifacts_select_parties" on public.agreement_contract_artifacts;
create policy "agreement_contract_artifacts_select_parties"
on public.agreement_contract_artifacts
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_agreements pa
    where pa.id = agreement_contract_artifacts.agreement_id
      and (
        pa.buyer_id = auth.uid()
        or pa.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "agreement_contract_artifacts_insert_admin" on public.agreement_contract_artifacts;
create policy "agreement_contract_artifacts_insert_admin"
on public.agreement_contract_artifacts
for insert
to authenticated
with check (
  public.get_my_role() = 'admin'
  and uploaded_by = auth.uid()
  and exists (
    select 1 from public.payment_agreements pa where pa.id = agreement_contract_artifacts.agreement_id
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'agreement-contracts',
  'agreement-contracts',
  false,
  26214400,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "agreement_contracts_storage_select" on storage.objects;
create policy "agreement_contracts_storage_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'agreement-contracts'
  and exists (
    select 1
    from public.payment_agreements pa
    where pa.id::text = split_part(name, '/', 1)
      and (
        pa.buyer_id = auth.uid()
        or pa.seller_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "agreement_contracts_storage_insert" on storage.objects;
create policy "agreement_contracts_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'agreement-contracts'
  and public.get_my_role() = 'admin'
  and exists (
    select 1
    from public.payment_agreements pa
    where pa.id::text = split_part(name, '/', 1)
  )
);

drop policy if exists "agreement_contracts_storage_delete" on storage.objects;
create policy "agreement_contracts_storage_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'agreement-contracts' and public.get_my_role() = 'admin');
