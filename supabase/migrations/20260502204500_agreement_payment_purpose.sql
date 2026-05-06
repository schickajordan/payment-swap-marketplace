-- Distinguish upfront deposit charges from recurring installments (Stripe PI + milestones).
do $$
begin
  create type public.agreement_payment_purpose as enum ('deposit', 'installment');
exception
  when duplicate_object then null;
end $$;

alter table public.agreement_payments
  add column if not exists purpose public.agreement_payment_purpose not null default 'installment';
