import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function isStripePaymentsConfigured(): boolean {
  const secret = String(process.env.STRIPE_SECRET_KEY ?? "").trim();
  const webhook = String(process.env.STRIPE_WEBHOOK_SECRET ?? "").trim();
  return Boolean(secret && webhook);
}

/**
 * Shown when hosting is missing pieces required for auth and/or payments.
 * Copy stays business-facing; env keys and readiness checks stay in repo docs and operator tooling.
 */
export function HostingConfigBanner() {
  const supabaseOk = isSupabaseConfigured();
  const stripeOk = isStripePaymentsConfigured();

  if (supabaseOk && stripeOk) {
    return null;
  }

  const detail =
    !supabaseOk && !stripeOk ?
      "Your organization's technical contact needs to connect the account database and payment processing in the production hosting settings, then publish a new deployment."
    : !supabaseOk ?
      "Your organization's technical contact needs to connect the account database in the production hosting settings, then publish a new deployment."
    : "Your organization's technical contact needs to connect payment processing in the production hosting settings, then publish a new deployment.";

  return (
    <div
      role="status"
      className="border-b border-amber-600/60 bg-[#3d2208] px-4 py-3 text-center text-[11px] leading-relaxed text-amber-50 md:text-xs"
    >
      <p className="font-medium text-amber-100/95">
        <strong className="text-amber-50">Limited functionality:</strong> sign-in, dashboards, checkout, and payouts may
        not work until production setup is finished.
      </p>
      <p className="mt-2 text-amber-50/95">{detail}</p>
      <p className="mt-1.5 text-amber-50/90">
        Need help?{" "}
        <Link href="/support" className="font-semibold !text-white underline decoration-amber-200/80 underline-offset-2">
          Help &amp; support
        </Link>{" "}
        ·{" "}
        <Link href="/demo" className="font-semibold !text-white underline decoration-amber-200/80 underline-offset-2">
          Product tour
        </Link>
        .
      </p>
    </div>
  );
}
