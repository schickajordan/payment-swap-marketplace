import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { FEE_STRUCTURE, LEGAL_SURFACE_DISCLAIMER, POSITIONING_LINES } from "@/lib/config/marketplace";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";

export default async function PricingPage() {
  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 md:px-8">
        <header>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Pricing & fees
          </h1>
          {POSITIONING_LINES.map((line) => (
            <p key={line} className="mt-3 text-sm text-slate-300 md:text-base">
              {line}
            </p>
          ))}
        </header>

        <section className="rounded-xl border border-white/10 bg-card p-6">
          <h2 className="text-lg font-semibold text-white">Fee schedule</h2>
          <ul className="mt-4 space-y-4">
            {FEE_STRUCTURE.map((row) => (
              <li key={row.name} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <p className="font-medium text-gold">{row.name}</p>
                <p className="mt-1 text-sm text-slate-300">{row.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace"
            className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
          >
            Enter marketplace
          </Link>
          <Link
            href="/seller"
            className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            List equipment
          </Link>
        </div>

        <section className="rounded-xl border border-white/10 bg-[#091c3d]/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gold">Shop a swap lane</h2>
          <p className="mt-2 text-sm text-slate-300">
            Filters line up with seller-selected templates—jump in without hunting the sidebar every time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
              <Link
                key={lane.deal}
                href={lane.href}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:border-gold/40"
              >
                {lane.compactLabel}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-6 text-sm text-amber-100">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-200">Disclosure</h2>
          <p className="mt-2 leading-relaxed">{LEGAL_SURFACE_DISCLAIMER}</p>
        </section>
      </main>
    </MarketingShell>
  );
}
