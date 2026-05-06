import Link from "next/link";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";

const DEAL_ROWS = [
  {
    heading: "Rent-style use",
    summary: "Possession for agreed months with a predictable payment.",
    body: "Best when you need iron on-site for defined work—you pay on a schedule similar to renting, keep the paperwork in-platform, and return or renew based on whatever the seller’s listing spells out.",
  },
  {
    heading: "Lease-to-own paths",
    summary: "Deposit + monthly installments, often ending in a payoff or buyout number.",
    body: "Structured like equipment finance-lite: upfront deposit, monthly installments, optional buyout, and timelines you can screenshot for your banker or partner—not buried in stray texts.",
  },
  {
    heading: "Buy / payoff",
    summary: "Settle up or accelerate ownership when agreements allow lump sums.",
    body: "When the contract supports it, accelerate payoff or close with a negotiated purchase—you still get receipts, installments, or escrow tooling if those rails are activated for that deal.",
  },
] as const;

/** Homepage strip — points readers to `/about` for the full narration. */
export function DealTypesOverview() {
  return (
    <section
      id="ways-to-equip"
      className="rounded-xl border border-gold/25 bg-[#071733]/55 p-6 md:p-8"
      aria-labelledby="ways-to-equip-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ways-to-equip-heading" className="text-xl font-bold text-white md:text-2xl">
            Rent, lease, or buy—with the terms surfaced up front
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
            Same fullness people expect after peer marketplaces rewired passenger cars—but here those habits map to cranes,
            trailers, fleets, deposits, payoff math, escrow when enabled, inspectors, lien conversations, invoicing—all
            in one flow. Every live listing declares a swap lane (
            <span className="text-slate-200">assumption</span>,{" "}
            <span className="text-slate-200">private payment takeover</span>, or{" "}
            <span className="text-slate-200">lease-to-own</span>) so filters, checklists, and milestones stay aligned with
            the paperwork.
          </p>
        </div>
        <Link
          href="/about"
          className="shrink-0 rounded-md border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:border-gold/50 hover:bg-white/5"
        >
          About us →
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {DEAL_ROWS.map((row) => (
          <div
            key={row.heading}
            className="rounded-lg border border-white/10 bg-[#091c3d]/70 p-5 shadow-inner shadow-black/20"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">{row.heading}</p>
            <p className="mt-2 text-lg font-bold text-white">{row.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{row.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 border-t border-white/10 pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Jump to lane</p>
        <div className="flex flex-wrap justify-center gap-2">
          {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
            <Link
              key={lane.deal}
              href={lane.href}
              className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-gold/40 hover:text-gold"
            >
              {lane.pillLabel}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-slate-400">
        Ready to poke around?{" "}
        <Link href="/marketplace" className="font-semibold text-gold hover:text-[#ffd14d]">
          Browse live listings →
        </Link>{" "}
        Need the longer story—including verification—read{" "}
        <Link href="/about" className="font-semibold text-gold hover:text-[#ffd14d]">
          About Payment Swap Marketplace
        </Link>
        .
      </p>
    </section>
  );
}
