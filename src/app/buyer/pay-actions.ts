"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { signInUrlWithNext } from "@/lib/navigation";
import { installmentApplicationFeeCents } from "@/lib/payments/fees";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import { STRIPE_PI_META_AGREEMENT_ID, STRIPE_PI_META_AGREEMENT_PAYMENT_ID } from "@/lib/stripe/payment-intent-metadata";
import { getStripeServerClient } from "@/lib/stripe/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function appBaseUrl() {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof u === "string" && u.startsWith("http")) {
    return u.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

async function tryAttachPaymentIntentId(installmentId: string, paymentIntentId: string) {
  try {
    const svc = createServiceRoleSupabaseClient();
    await svc
      .from("agreement_payments")
      .update({ stripe_payment_intent_id: paymentIntentId })
      .eq("id", installmentId)
      .in("status", ["scheduled", "processing", "failed"]);
  } catch {
    // Webhook `checkout.session.completed` will attach if service role is unavailable locally.
  }
}

/**
 * Buyer pays an installment via Stripe Checkout (card, etc.).
 * Funds route to the seller’s Connect account when onboarding is complete.
 */
export async function startInstallmentCheckoutAction(formData: FormData) {
  await requireRole(["buyer", "seller", "admin"]);
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(signInUrlWithNext("/buyer"));
  }

  const paymentId = String(formData.get("agreementPaymentId") ?? "").trim();
  if (!paymentId || !UUID_RE.test(paymentId)) {
    redirect("/buyer?error=Invalid installment reference.");
  }

  const { data: installment, error: iErr } = await supabase
    .from("agreement_payments")
    .select("id, agreement_id, due_date, amount_cents, status, stripe_payment_intent_id, purpose")
    .eq("id", paymentId)
    .maybeSingle();

  if (iErr || !installment) {
    redirect("/buyer?error=Installment not found.");
  }

  if (!["scheduled", "failed"].includes(installment.status)) {
    redirect(
      `/buyer?error=${encodeURIComponent("This installment is not payable right now (wrong status or already processing).")}`
    );
  }

  const { data: agreement, error: aErr } = await supabase
    .from("payment_agreements")
    .select("id, seller_id, buyer_id, status, escrow_enabled")
    .eq("id", installment.agreement_id)
    .maybeSingle();

  if (aErr || !agreement) {
    redirect("/buyer?error=Agreement not found for this installment.");
  }

  if (agreement.buyer_id !== user.id) {
    redirect("/buyer?error=You are not the buyer on this agreement.");
  }

  if (!["signed", "active"].includes(agreement.status)) {
    redirect(
      `/buyer?error=${encodeURIComponent("Payments unlock after the agreement is approved and signed.")}`
    );
  }

  const { data: payout, error: pErr } = await supabase
    .from("seller_payout_accounts")
    .select("stripe_account_id, charges_enabled, payouts_enabled")
    .eq("seller_id", agreement.seller_id)
    .maybeSingle();

  if (pErr) {
    redirect(`/buyer?error=${encodeURIComponent(pErr.message)}`);
  }

  if (!payout?.stripe_account_id || !payout.charges_enabled || !payout.payouts_enabled) {
    redirect(
      `/buyer?error=${encodeURIComponent(
        "The seller has not finished Stripe Connect payout setup yet. Message them in the deal thread or contact support."
      )}`
    );
  }

  const destination = payout.stripe_account_id;

  const feeCents = installmentApplicationFeeCents(installment.amount_cents, agreement.escrow_enabled);
  if (feeCents >= installment.amount_cents) {
    redirect("/buyer?error=Installment amount is too small for a secure split. Contact support.");
  }

  const stripe = getStripeServerClient();
  const base = appBaseUrl();
  const meta = {
    [STRIPE_PI_META_AGREEMENT_PAYMENT_ID]: installment.id,
    [STRIPE_PI_META_AGREEMENT_ID]: agreement.id,
  } satisfies Record<string, string>;

  const chargeLabel =
    installment.purpose === "deposit"
      ? `Equipment deposit · due ${installment.due_date}`
      : `Equipment installment · due ${installment.due_date}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    success_url: `${base}/buyer?payment=success`,
    cancel_url: `${base}/buyer?payment=cancelled`,
    client_reference_id: installment.id,
    metadata: meta,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: installment.amount_cents,
          product_data: {
            name: chargeLabel,
            description: `Agreement ${agreement.id.slice(0, 8)}…`,
          },
        },
      },
    ],
    payment_intent_data: {
      metadata: meta,
      transfer_data: { destination },
      ...(feeCents > 0 ? { application_fee_amount: feeCents } : {}),
    },
    expand: ["payment_intent"],
  });

  const piRef = session.payment_intent;
  const piId = typeof piRef === "string" ? piRef : piRef?.id ?? null;
  if (piId) {
    await tryAttachPaymentIntentId(installment.id, piId);
  }

  if (!session.url) {
    redirect("/buyer?error=Stripe did not return a checkout URL.");
  }

  redirect(session.url);
}
