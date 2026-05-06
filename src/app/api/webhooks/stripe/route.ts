import { NextResponse } from "next/server";
import Stripe from "stripe";
import { runStripeWebhookLedgerAndHandlers } from "@/lib/stripe/process-webhook";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";

/**
 * Stripe webhooks — verify signature, idempotent ledger (`stripe_webhook_events`),
 * then reconcile `agreement_payments` via PaymentIntent lifecycle events.
 *
 * Requires: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY (RLS-safe server writes).
 *
 * Stripe Dashboard: send at minimum
 * checkout.session.completed,
 * payment_intent.processing / payment_intent.succeeded /
 * payment_intent.payment_failed / payment_intent.canceled
 *
 * Metadata on PaymentIntent: see `src/lib/stripe/payment-intent-metadata.ts`.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!secret) {
    return NextResponse.json({ received: false, error: "STRIPE_WEBHOOK_SECRET not configured" }, { status: 501 });
  }

  if (!signature) {
    return NextResponse.json({ received: false, error: "Missing stripe-signature" }, { status: 400 });
  }

  let supabaseReturn: ReturnType<typeof createServiceRoleSupabaseClient>;
  try {
    supabaseReturn = createServiceRoleSupabaseClient();
  } catch {
    return NextResponse.json(
      { received: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 501 }
    );
  }

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ received: false, error: "STRIPE_SECRET_KEY not configured" }, { status: 501 });
    }

    const stripe = new Stripe(stripeKey);
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    try {
      const { duplicateComplete, detail } = await runStripeWebhookLedgerAndHandlers(supabaseReturn, event);

      return NextResponse.json({
        received: true,
        type: event.type,
        id: event.id,
        duplicateComplete,
        detail,
      });
    } catch (handlerErr) {
      const msg = handlerErr instanceof Error ? handlerErr.message : "handler error";
      return NextResponse.json({ received: false, error: msg, eventId: event.id }, { status: 500 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "verification failed";
    return NextResponse.json({ received: false, error: msg }, { status: 400 });
  }
}
