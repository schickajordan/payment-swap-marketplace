-- Internal admin-only activity + one thread per agreement
alter table public.agreement_events
  add column if not exists is_internal boolean not null default false;

create unique index if not exists message_threads_agreement_id_key
  on public.message_threads (agreement_id);

drop policy if exists "agreement_events_select_participant_or_admin" on public.agreement_events;
create policy "agreement_events_select_participant_or_admin"
on public.agreement_events
for select
to authenticated
using (
  public.get_my_role() = 'admin'
  or (
    exists (
      select 1
      from public.payment_agreements a
      where a.id = agreement_events.agreement_id
        and (
          a.seller_id = auth.uid()
          or a.buyer_id = auth.uid()
        )
    )
    and agreement_events.is_internal = false
  )
);

drop policy if exists "agreement_events_insert_participant_or_admin" on public.agreement_events;
create policy "agreement_events_insert_participant_or_admin"
on public.agreement_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.payment_agreements a
    where a.id = agreement_events.agreement_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
  and (
    agreement_events.is_internal = false
    or public.get_my_role() = 'admin'
  )
);
