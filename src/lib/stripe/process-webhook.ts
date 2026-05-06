import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { Database } from "@/lib/supabase/database.types";
import type { Json } from "@/lib/supabase/database.types";
import {
  recordDepositPaidIfEligible,
  recordFirstInstallmentPaidIfEligible,
} from "@/lib/analytics/liquidity-milestones";
import {
  STRIPE_PI_META_AGREEMENT_ID,
  STRIPE_PI_META_AGREEMENT_PAYMENT_ID,
} from "@/lib/stripe/payment-intent-metadata";

const PG_UNIQUE_VIOLATION = "23505";

function isoFromStripeEventSecs(createdSecs: number) {
  return new Date(createdSecs * 1000).toISOString();
}

/** Record receipt + replay-safe processing gate; marks processed_at after success */
export async function runStripeWebhookLedgerAndHandlers(
  supabase: SupabaseClient<Database>,
  event: Stripe.Event
): Promise<{ duplicateComplete?: boolean; detail: string }> {
  const { error: insertErr } = await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    livemode: event.livemode,
  });

  const dupReceipt =
    insertErr?.code === PG_UNIQUE_VIOLATION ||
    (insertErr?.message?.toLowerCase().includes("duplicate key") ?? false);

  if (insertErr && dupReceipt) {
    const { data: existing } = await supabase
      .from("stripe_webhook_events")
      .select("processed_at")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existing?.processed_at) {
      return { duplicateComplete: true, detail: "already_processed" };
    }
    // Replay after a crash before processed_at — run handlers again (handlers are row-idempotent).
  } else if (insertErr) {
    throw new Error(`stripe_webhook_events insert: ${insertErr.message}`);
  }

  try {
    const detail = await dispatchStripeWebhook(supabase, event);
    const { error: markErr } = await supabase
      .from("stripe_webhook_events")
      .update({ processed_at: new Date().toISOString(), processing_error: null })
      .eq("stripe_event_id", event.id);

    if (markErr) {
      throw new Error(`stripe_webhook_events finalize: ${markErr.message}`);
    }

    return { detail };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase
      .from("stripe_webhook_events")
      .update({ processing_error: msg.slice(0, 2000) })
      .eq("stripe_event_id", event.id);
    throw e;
  }
}

async function dispatchStripeWebhook(
  supabase: SupabaseClient<Database>,
  event: Stripe.Event
): Promise<string> {
  const observedAt = isoFromStripeEventSecs(event.created);

  switch (event.type) {
    case "payment_intent.processing":
      return handlePaymentIntentStatus(
        supabase,
        event.data.object as Stripe.PaymentIntent,
        "processing",
        observedAt
      );
    case "payment_intent.succeeded":
      return handlePaymentIntentStatus(
        supabase,
        event.data.object as Stripe.PaymentIntent,
        "paid",
        observedAt
      );
    case "payment_intent.payment_failed":
    case "payment_intent.canceled":
      return handlePaymentIntentStatus(
        supabase,
        event.data.object as Stripe.PaymentIntent,
        "failed",
        observedAt
      );
    case "checkout.session.completed":
      return handleCheckoutSessionCompleted(supabase, event.data.object as Stripe.Checkout.Session);
    default:
      return `noop:${event.type}`;
  }
}

async function handleCheckoutSessionCompleted(
  supabase: SupabaseClient<Database>,
  session: Stripe.Checkout.Session
) {
  const rawId = session.metadata?.[STRIPE_PI_META_AGREEMENT_PAYMENT_ID];
  const paymentId = typeof rawId === "string" ? rawId.trim() : "";
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!paymentId || !uuidRe.test(paymentId)) {
    return `checkout_completed_no_installment_meta:${session.id}`;
  }

  const piField = session.payment_intent;
  const piId = typeof piField === "string" ? piField : piField?.id ?? null;
  if (!piId) {
    return `checkout_completed_no_pi:${session.id}`;
  }

  const { data: touched, error } = await supabase
    .from("agreement_payments")
    .update({ stripe_payment_intent_id: piId })
    .eq("id", paymentId)
    .in("status", ["scheduled", "processing", "failed"])
    .select("id");

  if (error) {
    throw new Error(`checkout link PI: ${error.message}`);
  }

  if (!touched?.length) {
    return `checkout_link_skipped:${session.id}:${paymentId}`;
  }

  return `checkout_linked:${session.id}`;
}

async function resolveAgreementPaymentRow(
  supabase: SupabaseClient<Database>,
  pi: Stripe.PaymentIntent
) {
  const { data: byPi, error: errPi } = await supabase
    .from("agreement_payments")
    .select("id, agreement_id, status, stripe_payment_intent_id, amount_cents, purpose")
    .eq("stripe_payment_intent_id", pi.id)
    .maybeSingle();

  if (errPi) {
    throw new Error(`agreement_payments lookup by PI: ${errPi.message}`);
  }
  if (byPi) {
    return byPi;
  }

  const rawPaymentId = pi.metadata?.[STRIPE_PI_META_AGREEMENT_PAYMENT_ID];
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (rawPaymentId && uuidRe.test(String(rawPaymentId))) {
    const { data: byId, error: errId } = await supabase
      .from("agreement_payments")
      .select("id, agreement_id, status, stripe_payment_intent_id, amount_cents, purpose")
      .eq("id", rawPaymentId)
      .maybeSingle();

    if (errId) {
      throw new Error(`agreement_payments lookup by id: ${errId.message}`);
    }

    if (byId) {
      const expectedAgreementId = pi.metadata?.[STRIPE_PI_META_AGREEMENT_ID];
      if (
        expectedAgreementId &&
        typeof expectedAgreementId === "string" &&
        uuidRe.test(expectedAgreementId) &&
        byId.agreement_id !== expectedAgreementId
      ) {
        throw new Error("metadata.agreement_id does not match installment row.");
      }

      return byId;
    }
  }

  return null;
}

async function handlePaymentIntentStatus(
  supabase: SupabaseClient<Database>,
  pi: Stripe.PaymentIntent,
  outcome: "processing" | "paid" | "failed",
  observedAtIso: string
): Promise<string> {
  const row = await resolveAgreementPaymentRow(supabase, pi);
  if (!row) {
    return `payment_intent_unmatched:${pi.id}`;
  }

  if (outcome === "processing") {
    const { data: touched, error } = await supabase
      .from("agreement_payments")
      .update({
        status: "processing",
        stripe_payment_intent_id: pi.id,
      })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("id");

    if (error) {
      throw new Error(`agreement_payments processing update: ${error.message}`);
    }
    if (!touched?.length) {
      return `payment_intent_processing_skipped:${pi.id}:${row.status}`;
    }

    await emitStripeAgreementEvent(supabase, row, {
      outcome: "processing",
      pi,
      observedAtIso,
    });
    return `payment_intent_processing:${pi.id}:${row.id}`;
  }

  if (outcome === "paid") {
    const cents = pi.amount_received ?? pi.amount ?? null;
    if (cents != null && cents !== row.amount_cents) {
      await emitStripeAgreementEvent(supabase, row, {
        outcome: "amount_mismatch",
        pi,
        observedAtIso,
        extraMeta: {
          installment_amount_cents: row.amount_cents,
          stripe_amount_received: cents,
        },
        isInternal: true,
      });
    }

    const { data: touched, error } = await supabase
      .from("agreement_payments")
      .update({
        status: "paid",
        paid_at: observedAtIso,
        stripe_payment_intent_id: pi.id,
      })
      .eq("id", row.id)
      .in("status", ["scheduled", "processing"])
      .select("id, agreement_id, status, purpose");

    if (error) {
      throw new Error(`agreement_payments paid update: ${error.message}`);
    }

    if (!touched?.length) {
      if (row.status === "paid") {
        return `payment_intent_already_paid:${pi.id}:${row.id}`;
      }
      return `payment_intent_paid_noop:${pi.id}:${row.status}`;
    }

    const paidRow = touched[0];
    await emitStripeAgreementEvent(supabase, paidRow ?? row, {
      outcome: "paid",
      pi,
      observedAtIso,
    });

    if (paidRow?.agreement_id) {
      await recordDepositPaidIfEligible({
        supabase,
        agreementId: paidRow.agreement_id,
        installmentId: paidRow.id,
        purpose: paidRow.purpose,
      });

      await recordFirstInstallmentPaidIfEligible({
        supabase,
        agreementId: paidRow.agreement_id,
        installmentId: paidRow.id,
      });
    }

    return `payment_intent_paid:${pi.id}:${row.id}`;
  }

  const { data: touched, error } = await supabase
    .from("agreement_payments")
    .update({
      status: "failed",
      paid_at: null,
      stripe_payment_intent_id: pi.id,
    })
    .eq("id", row.id)
    .in("status", ["scheduled", "processing"])
    .select("id");

  if (error) {
    throw new Error(`agreement_payments failed update: ${error.message}`);
  }

  if (!touched?.length) {
    return `payment_intent_failed_skipped:${pi.id}:${row.status}`;
  }

  const decline = pi.last_payment_error?.message;
  await emitStripeAgreementEvent(supabase, row, {
    outcome: "failed",
    pi,
    observedAtIso,
    extraMeta:
      decline ?
        ({
            decline_message: decline,
          } satisfies Record<string, Json>)
      : {},
  });

  return `payment_intent_failed:${pi.id}:${row.id}`;
}

async function emitStripeAgreementEvent(
  supabase: SupabaseClient<Database>,
  row: Pick<
    Database["public"]["Tables"]["agreement_payments"]["Row"],
    "id" | "agreement_id" | "status" | "purpose"
  >,
  opts: {
    outcome: "processing" | "paid" | "failed" | "amount_mismatch";
    pi: Stripe.PaymentIntent;
    observedAtIso: string;
    extraMeta?: Record<string, Json>;
    isInternal?: boolean;
  }
) {
  const typeMap = {
    processing: "stripe_payment_processing",
    paid: "stripe_payment_succeeded",
    failed: "stripe_payment_failed",
    amount_mismatch: "stripe_amount_mismatch",
  } as const;

  const chargeNoun = row.purpose === "deposit" ? "Deposit" : "Installment";

  const messages = {
    processing: `${chargeNoun} is processing via Stripe.`,
    paid: `${chargeNoun} marked paid (Stripe).`,
    failed: `Stripe reported a failed payment for this ${chargeNoun.toLowerCase()}.`,
    amount_mismatch: `Stripe payment amount differs from schedule (manual review).`,
  } as const;

  const meta: Json = {
    installment_id: row.id,
    payment_purpose: row.purpose,
    stripe_payment_intent_id: opts.pi.id,
    observed_at: opts.observedAtIso,
    ...(opts.extraMeta ?? {}),
  };

  const { error } = await supabase.from("agreement_events").insert({
    agreement_id: row.agreement_id,
    actor_id: null,
    event_type: typeMap[opts.outcome],
    message: messages[opts.outcome],
    metadata: meta,
    is_internal: opts.isInternal ?? opts.outcome === "amount_mismatch",
  });

  if (error) {
    throw new Error(`agreement_events insert (stripe webhook): ${error.message}`);
  }
}
