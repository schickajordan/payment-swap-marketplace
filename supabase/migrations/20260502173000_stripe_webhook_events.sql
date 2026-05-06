-- Idempotent Stripe webhook ledger (processed only by service-role server routes)
create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  livemode boolean not null default false,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create index if not exists stripe_webhook_events_processed_idx
  on public.stripe_webhook_events (processed_at);

alter table public.stripe_webhook_events enable row level security;
