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
 * Enterprise attestations (SOC 2, pen tests, DPAs) are organizational — not derivable here.
 */
export function GET() {
  const missingCore = missingKeys(CORE_KEYS);
  const missingPayments = missingKeys(PAYMENTS_KEYS);

  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const deploy =
    sha ?
      {
        commit: sha.slice(0, 7),
        branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      }
    : null;

  const onVercel = process.env.VERCEL === "1";
  const vercelEnv = process.env.VERCEL_ENV ?? null;

  return NextResponse.json(
    {
      ok: true,
      service: "payment-swap-marketplace",
      timestamp: new Date().toISOString(),
      deploy,
      runtime: {
        nodeEnv: process.env.NODE_ENV ?? null,
        vercel: onVercel,
        vercelEnv,
        /** HSTS is enabled in `next.config.ts` when `VERCEL_ENV === "production"`. */
        hstsEnabledOnProdDeploy: vercelEnv === "production",
      },
      checks: {
        core_config: missingCore.length === 0,
        payments_pipeline: missingPayments.length === 0,
      },
      missing_env: {
        core: missingCore.length > 0 ? missingCore : undefined,
        payments: missingPayments.length > 0 ? missingPayments : undefined,
      },
      assurance: {
        ci_dependency_gate:
          "GitHub Actions runs `npm run audit:prod` (high+ severity, production tree only) before `npm run verify`.",
        dev_tooling_note:
          "The Vercel CLI devDependency may report additional advisories; it is not shipped in the production bundle.",
        out_of_band_for_enterprise_buyers: [
          "Independent penetration test and remediation",
          "SOC 2 / ISO 27001 or equivalent customer evidence",
          "Stripe Connect platform / money-transmission legal review",
          "Privacy counsel, DPAs, and data-residency decisions",
        ],
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
