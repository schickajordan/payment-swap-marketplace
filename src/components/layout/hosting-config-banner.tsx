import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Shown only when the public database/auth layer is missing (no sign-in, no dashboards).
 * Stripe and other payment secrets are tracked in `/api/health` so checkout readiness
 * does not alarm visitors who only need marketing and demos.
 */
export function HostingConfigBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div
      role="status"
      className="border-b border-amber-600/60 bg-[#3d2208] px-4 py-3 text-center text-[11px] leading-relaxed text-amber-50 md:text-xs"
    >
      <p className="font-medium text-amber-100/95">
        <strong className="text-amber-50">Limited functionality:</strong> sign-in and member dashboards are unavailable
        until the live account database is connected for this site.
      </p>
      <p className="mt-2 text-amber-50/95">
        Your organization&apos;s technical contact can finish that in the production hosting settings and publish a new
        deployment.
      </p>
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
