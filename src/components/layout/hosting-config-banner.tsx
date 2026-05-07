import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function isStripePaymentsConfigured(): boolean {
  const secret = String(process.env.STRIPE_SECRET_KEY ?? "").trim();
  const webhook = String(process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
  return Boolean(secret && webhook);
}

/**
 * Shown when production (or preview) hosting is missing pieces operators expect.
 * Keeps marketing pages honest when auth/checkout cannot work yet.
 */
export function HostingConfigBanner() {
  const supabaseOk = isSupabaseConfigured();
  const stripeOk = isStripePaymentsConfigured();

  if (supabaseOk && stripeOk) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/45 bg-amber-950 px-4 py-2.5 text-center text-[11px] leading-snug text-amber-50 md:text-xs">
      <p>
        <strong className="font-semibold">Hosting setup incomplete — some controls will not work until this is fixed.</strong>
      </p>
      <p className="mt-1.5">
        {!supabaseOk ?
          <span className="block md:inline">
            <span className="font-semibold text-amber-100">Supabase:</span> add{" "}
            <code className="rounded bg-black/30 px-1 py-px font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="rounded bg-black/30 px-1 py-px font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            (plus server <code className="rounded bg-black/30 px-1 py-px font-mono text-[10px]">SUPABASE_SERVICE_ROLE_KEY</code>
            ) so sign-in and dashboards run.{" "}
            <Link href="/api/health" className="font-semibold text-amber-100 underline underline-offset-2">
              /api/health
            </Link>
          </span>
        : null}
        {!supabaseOk && !stripeOk ?
          <span className="mx-1 hidden md:inline" aria-hidden>
            ·
          </span>
        : null}
        {!stripeOk ?
          <span className={`block md:inline ${!supabaseOk ? "mt-1.5 md:mt-0" : ""}`}>
            <span className="font-semibold text-amber-100">Stripe:</span> add{" "}
            <code className="rounded bg-black/30 px-1 py-px font-mono text-[10px]">STRIPE_SECRET_KEY</code> and{" "}
            <code className="rounded bg-black/30 px-1 py-px font-mono text-[10px]">STRIPE_WEBHOOK_SECRET</code> for checkout
            and seller payouts.
          </span>
        : null}
      </p>
    </div>
  );
}
