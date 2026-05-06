-- Support pre-application inquiries: one thread per listing + buyer, alongside agreement-scoped threads.
alter table public.message_threads
  alter column agreement_id drop not null;

alter table public.message_threads
  add column if not exists listing_id uuid references public.listings(id) on delete cascade,
  add column if not exists inquiry_buyer_id uuid references public.profiles(id) on delete cascade;

alter table public.message_threads drop constraint if exists message_threads_exactly_one_context;

alter table public.message_threads add constraint message_threads_exactly_one_context check (
  (
    agreement_id is not null
    and listing_id is null
    and inquiry_buyer_id is null
  )
  or (
    agreement_id is null
    and listing_id is not null
    and inquiry_buyer_id is not null
  )
);

create unique index if not exists message_threads_listing_buyer_uidx
  on public.message_threads (listing_id, inquiry_buyer_id)
  where listing_id is not null and inquiry_buyer_id is not null;

-- Replace thread policies so listing inquiries participate correctly.
drop policy if exists "threads_select_participant_or_admin" on public.message_threads;
drop policy if exists "threads_insert_participant_or_admin" on public.message_threads;
drop policy if exists "messages_select_participant_or_admin" on public.thread_messages;
drop policy if exists "messages_insert_participant_or_admin" on public.thread_messages;

create policy "threads_select_agreement_or_listing_or_admin"
on public.message_threads
for select
to authenticated
using (
  (
    agreement_id is not null
    and exists (
      select 1
      from public.payment_agreements a
      where a.id = message_threads.agreement_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
    )
  )
  or (
    listing_id is not null
    and inquiry_buyer_id is not null
    and exists (
      select 1
      from public.listings l
      where l.id = message_threads.listing_id
      and (
        l.seller_id = auth.uid()
        or message_threads.inquiry_buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
    )
  )
);

create policy "threads_insert_agreement_or_listing_inquiry"
on public.message_threads
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (
    (
      agreement_id is not null
      and listing_id is null
      and inquiry_buyer_id is null
      and exists (
        select 1
        from public.payment_agreements a
        where a.id = message_threads.agreement_id
        and (
          a.seller_id = auth.uid()
          or a.buyer_id = auth.uid()
          or public.get_my_role() = 'admin'
        )
      )
    )
    or (
      agreement_id is null
      and listing_id is not null
      and inquiry_buyer_id = auth.uid()
      and exists (
        select 1
        from public.listings l
        where l.id = message_threads.listing_id
        and l.status = 'active'
        and l.seller_id <> auth.uid()
      )
    )
  )
);

create policy "messages_select_via_thread_agreement_or_listing"
on public.thread_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.message_threads t
    join public.payment_agreements a on a.id = t.agreement_id
    where t.id = thread_messages.thread_id
      and t.agreement_id is not null
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
  or exists (
    select 1
    from public.message_threads t
    join public.listings l on l.id = t.listing_id
    where t.id = thread_messages.thread_id
      and t.listing_id is not null
      and (
        l.seller_id = auth.uid()
        or t.inquiry_buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

create policy "messages_insert_via_thread_agreement_or_listing"
on public.thread_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and (
    exists (
      select 1
      from public.message_threads t
      join public.payment_agreements a on a.id = t.agreement_id
      where t.id = thread_messages.thread_id
        and t.agreement_id is not null
        and (
          a.seller_id = auth.uid()
          or a.buyer_id = auth.uid()
          or public.get_my_role() = 'admin'
        )
    )
    or exists (
      select 1
      from public.message_threads t
      join public.listings l on l.id = t.listing_id
      where t.id = thread_messages.thread_id
        and t.listing_id is not null
        and (
          l.seller_id = auth.uid()
          or t.inquiry_buyer_id = auth.uid()
          or public.get_my_role() = 'admin'
        )
    )
  )
);
