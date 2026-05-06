import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { FEE_STRUCTURE, LEGAL_SURFACE_DISCLAIMER, POSITIONING_LINES } from "@/lib/config/marketplace";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { authRoutes } from "@/lib/navigation";

const signUpSeller = `${authRoutes.signUp}?role=seller`;

export default async function PricingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 md:px-8">
        <header>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Pricing & fees
          </h1>
          {POSITIONING_LINES.map((line) => (
            <p key={line} className="mt-3 text-sm font-medium leading-relaxed text-muted md:text-base">
              {line}
            </p>
          ))}
        </header>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Fee schedule</h2>
          <ul className="mt-4 space-y-4">
            {FEE_STRUCTURE.map((row) => (
              <li key={row.name} className="border-b border-[var(--steel-line)] pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-foreground">{row.name}</p>
                <p className="mt-1 text-sm text-muted">{row.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="rounded-md bg-[var(--button-primary-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] hover:opacity-95"
          >
            Enter marketplace
          </Link>
          <Link
            href={signUpSeller}
            className="rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-[var(--card)]"
          >
            Publish a listing (seller signup)
          </Link>
        </div>

        <section className="rounded-xl border border-[var(--steel-line)] bg-[var(--card)] p-5 shadow-[0_8px_28px_rgba(5,27,53,0.06)]">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">Shop by swap lane</h2>
          <p className="mt-2 text-sm font-medium text-muted">
            Filters mirror seller-declared templates—straight to inventory without resetting the sidebar.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
              <Link
                key={lane.deal}
                href={lane.href}
                className="rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-3 py-1.5 text-xs font-semibold text-foreground hover:border-[var(--gold-strong)]"
              >
                {lane.compactLabel}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-6 text-sm font-medium leading-relaxed text-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Regulatory disclosure</h2>
          <p className="mt-2 text-foreground/95">{LEGAL_SURFACE_DISCLAIMER}</p>
        </section>
      </main>
    </MarketingShell>
  );
}
