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
      className="rounded-xl border border-[var(--steel-line)] bg-[var(--charcoal-panel)] p-6 md:p-8"
      aria-labelledby="ways-to-equip-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ways-to-equip-heading" className="font-display text-xl font-bold text-foreground md:text-2xl">
            Deal lanes—not vague “contact seller” placeholders
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-muted md:text-base">
            Each lane defines how obligation and collateral move (
            <span className="text-foreground">assumption</span>,{" "}
            <span className="text-foreground">private payment takeover</span>,{" "}
            <span className="text-foreground">lease-to-own</span>). Filters, checklists, and servicing milestones inherit
            the lane automatically so operating partners read one consistent file.
          </p>
        </div>
        <Link
          href="/about"
          className="shrink-0 rounded-md border border-[var(--steel-line)] px-4 py-2 text-sm font-semibold text-foreground hover:border-gold/50 hover:bg-[var(--card-muted)]"
        >
          About us →
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {DEAL_ROWS.map((row) => (
          <div
            key={row.heading}
            className="rounded-lg border border-[var(--steel-line)] bg-[var(--card)] p-5 shadow-inner shadow-black/10"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">{row.heading}</p>
            <p className="mt-2 text-lg font-bold text-foreground">{row.summary}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{row.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col items-center gap-3 border-t border-[var(--steel-line)] pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Jump to lane</p>
        <div className="flex flex-wrap justify-center gap-2">
          {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
            <Link
              key={lane.deal}
              href={lane.href}
              className="rounded-full border border-[var(--steel-line)] px-3 py-1 text-xs font-semibold text-foreground hover:border-gold/40 hover:text-gold"
            >
              {lane.pillLabel}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        Ready to poke around?{" "}
        <Link href="/marketplace" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          Browse live listings →
        </Link>{" "}
        Policy detail lives in{" "}
        <Link href="/about" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          About Payment Swap Marketplace
        </Link>
        .
      </p>
    </section>
  );
}
