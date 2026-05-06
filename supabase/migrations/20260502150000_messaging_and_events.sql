-- Messaging + activity events for operational transparency
create table if not exists public.agreement_events (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.payment_agreements(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  agreement_id uuid not null references public.payment_agreements(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.agreement_events enable row level security;
alter table public.message_threads enable row level security;
alter table public.thread_messages enable row level security;

drop policy if exists "agreement_events_select_participant_or_admin" on public.agreement_events;
create policy "agreement_events_select_participant_or_admin"
on public.agreement_events
for select
to authenticated
using (
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
);

drop policy if exists "threads_select_participant_or_admin" on public.message_threads;
create policy "threads_select_participant_or_admin"
on public.message_threads
for select
to authenticated
using (
  exists (
    select 1
    from public.payment_agreements a
    where a.id = message_threads.agreement_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "threads_insert_participant_or_admin" on public.message_threads;
create policy "threads_insert_participant_or_admin"
on public.message_threads
for insert
to authenticated
with check (
  created_by = auth.uid()
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
);

drop policy if exists "messages_select_participant_or_admin" on public.thread_messages;
create policy "messages_select_participant_or_admin"
on public.thread_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.message_threads t
    join public.payment_agreements a on a.id = t.agreement_id
    where t.id = thread_messages.thread_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);

drop policy if exists "messages_insert_participant_or_admin" on public.thread_messages;
create policy "messages_insert_participant_or_admin"
on public.thread_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.message_threads t
    join public.payment_agreements a on a.id = t.agreement_id
    where t.id = thread_messages.thread_id
      and (
        a.seller_id = auth.uid()
        or a.buyer_id = auth.uid()
        or public.get_my_role() = 'admin'
      )
  )
);
