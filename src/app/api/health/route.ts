import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CORE_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
] as const;

/** Checkout, Connect sync, escrow writes, Stripe webhooks ledger. */
const PAYMENTS_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function missingKeys(keys: readonly string[]) {
  return keys.filter((k) => !(process.env[k] && String(process.env[k]).trim().length > 0));
}

/**
 * Lightweight liveness + non-secret readiness hints for operators.
 */
export function GET() {
  const missingCore = missingKeys(CORE_KEYS);
  const missingPayments = missingKeys(PAYMENTS_KEYS);

  return NextResponse.json({
    ok: true,
    service: "payment-swap-marketplace",
    timestamp: new Date().toISOString(),
    checks: {
      core_config: missingCore.length === 0,
      payments_pipeline: missingPayments.length === 0,
    },
    missing_env: {
      core: missingCore.length > 0 ? missingCore : undefined,
      payments: missingPayments.length > 0 ? missingPayments : undefined,
    },
  });
}
