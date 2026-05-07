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
    <div
      role="status"
      className="border-b border-amber-600/60 bg-[#3d2208] px-4 py-3 text-center text-[11px] leading-relaxed text-amber-50 md:text-xs"
    >
      <p className="font-medium text-amber-100/95">
        <strong className="text-amber-50">Setup notice (operators):</strong> hosting is missing API keys, so sign-in,
        dashboards, checkout, or payouts may not work until Vercel env is completed.
      </p>
      <p className="mt-2 text-amber-50/95">
        {!supabaseOk ?
          <span className="block md:inline">
            <span className="sr-only">Supabase. </span>
            <span className="font-semibold text-amber-100">Supabase</span>
            <span aria-hidden>: </span>
            set{" "}
            <code className="rounded border border-amber-800/80 bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-amber-50">
              NEXT_PUBLIC_SUPABASE_URL
            </code>
            ,{" "}
            <code className="rounded border border-amber-800/80 bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-amber-50">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            , and{" "}
            <code className="rounded border border-amber-800/80 bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-amber-50">
              SUPABASE_SERVICE_ROLE_KEY
            </code>
            . Status:{" "}
            <Link href="/api/health" className="font-semibold !text-white underline decoration-amber-200/80 underline-offset-2">
              /api/health
            </Link>
            .
          </span>
        : null}
        {!supabaseOk && !stripeOk ?
          <span className="mx-1 hidden md:inline font-semibold text-amber-200/90" aria-hidden>
            ·
          </span>
        : null}
        {!stripeOk ?
          <span className={`block md:inline ${!supabaseOk ? "mt-2 md:mt-0" : ""}`}>
            <span className="sr-only">Stripe. </span>
            <span className="font-semibold text-amber-100">Stripe</span>
            <span aria-hidden>: </span>set{" "}
            <code className="rounded border border-amber-800/80 bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-amber-50">
              STRIPE_SECRET_KEY
            </code>{" "}
            and{" "}
            <code className="rounded border border-amber-800/80 bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-amber-50">
              STRIPE_WEBHOOK_SECRET
            </code>
            .
          </span>
        : null}
      </p>
    </div>
  );
}
