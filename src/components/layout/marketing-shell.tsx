import { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { TopNav } from "@/components/layout/top-nav";
import { TrustDeliveryStrip } from "@/components/layout/trust-delivery-strip";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type MarketingShellProps = {
  children: ReactNode;
  /** Narrow strip below nav for legal-safe context */
  showComplianceStrip?: boolean;
  /** Prefills the catalog search omnibox (e.g. on `/marketplace`). */
  catalogSearchDefault?: string;
};

export async function MarketingShell({
  children,
  showComplianceStrip = true,
  catalogSearchDefault,
}: MarketingShellProps) {
  const showLocalSetupBanner =
    process.env.NODE_ENV === "development" && !isSupabaseConfigured();

  return (
    <div className="app-shell-bg flex min-h-screen flex-col">
      <TopNav marketplaceSearchDefault={catalogSearchDefault} />
      {showLocalSetupBanner ?
        <div className="border-b border-amber-400/50 bg-amber-950 px-4 py-2 text-center text-[11px] leading-snug text-amber-50 md:text-xs">
          <strong className="font-semibold">Local preview:</strong> add{" "}
          <code className="rounded bg-black/35 px-1 py-px font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-black/35 px-1 py-px font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
          <code className="rounded bg-black/35 px-1 py-px font-mono">.env.local</code>
          {" "}so sign-up, dashboards, listings, and checkout behave like production. Stripe keys unlock payments.
        </div>
      : null}
      <TrustDeliveryStrip />
      {showComplianceStrip ? (
        <aside className="border-b border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2.5 text-center text-[11px] font-medium leading-snug text-foreground md:text-xs">
          <strong className="font-semibold">Business accounts only.</strong> This marketplace coordinates transactions between
          counterparties; it does not replace your attorney, lender, insurer, or DOT counsel. Published fees apply before
          you pay.
        </aside>
      ) : null}
      {children}
      <SiteFooter />
    </div>
  );
}
