-- Deal templates (listing intent) + operational checkpoints (per agreement swap room)

CREATE TYPE public.deal_template AS ENUM (
  'assumption',
  'payment_swap_private',
  'lease_to_own'
);

CREATE TYPE public.deal_checkpoint AS ENUM (
  'intake',
  'buyer_qualified',
  'lender_workflow',
  'permissibility_documented',
  'lender_cleared',
  'insurance_gate',
  'handoff_complete',
  'servicing_active',
  'payoff_title',
  'completed'
);

ALTER TABLE public.listings
  ADD COLUMN deal_template public.deal_template NOT NULL DEFAULT 'lease_to_own',
  ADD COLUMN collateral_is_titled boolean NOT NULL DEFAULT false;

ALTER TABLE public.payment_agreements
  ADD COLUMN deal_checkpoint public.deal_checkpoint NOT NULL DEFAULT 'intake';

-- Best-effort backfill from legacy metadata label
UPDATE public.listings
SET deal_template =
  CASE coalesce(trim(metadata ->> 'agreement_type'), '')
    WHEN 'payment-swap' THEN 'payment_swap_private'::public.deal_template
    WHEN 'rental-to-own' THEN 'lease_to_own'::public.deal_template
    ELSE 'lease_to_own'::public.deal_template
  END;
