alter table public.payment_agreements
  add column if not exists contract_version text,
  add column if not exists contract_status text not null default 'draft',
  add column if not exists contract_uploaded_at timestamptz,
  add column if not exists contract_executed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payment_agreements_contract_status_check'
  ) then
    alter table public.payment_agreements
      add constraint payment_agreements_contract_status_check
      check (contract_status in ('draft', 'uploaded', 'executed'));
  end if;
end $$;

create index if not exists payment_agreements_contract_status_idx
  on public.payment_agreements (contract_status);
