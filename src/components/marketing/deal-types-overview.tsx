import Link from "next/link";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";

const DEAL_ROWS = [
  {
    heading: "Lease / finance assumption",
    summary: "A qualified buyer steps in where the contract allows—with lessor paperwork surfaced first.",
    body: "Payment position, payoff or transfer fees, insurer requirements, and lender questions stay in one thread so approval isn’t rebuilt from screenshots.",
  },
  {
    heading: "Private payment takeover",
    summary: "Structured seller-to-buyer continuity when iron stays titled or financed in the seller’s name temporarily.",
    body: "For deals that are not a formal assumption yet still move monthly obligation to the buyer. Milestones, escrow when enabled, and insurance gates stay explicit.",
  },
  {
    heading: "Lease-to-own unwind",
    summary: "Deposit + installments with a documented buyout or payoff finish line.",
    body: "Listings show deposit, monthly cadence, and buyout numbers up front so buyers and lenders see the full schedule.",
  },
] as const;

/** Homepage strip — lease-transfer lanes for heavy equipment. */
export function DealTypesOverview() {
  return (
    <section
      id="ways-to-equip"
      className="rounded-xl border border-[var(--steel-line)] bg-[var(--card)] p-6 shadow-[0_8px_28px_rgba(5,27,53,0.06)] md:p-8"
      aria-labelledby="ways-to-equip-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ways-to-equip-heading" className="font-display text-xl font-bold text-foreground md:text-2xl">
            Three deal lanes—terms first, not “call for price”
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-muted md:text-base">
            Each lane defines how obligation moves:{" "}
            <span className="text-foreground">assumption</span>,{" "}
            <span className="text-foreground">private takeover</span>, or{" "}
            <span className="text-foreground">lease-to-own</span>. Filters and checklists follow that choice so everyone
            works from the same playbook.
          </p>
        </div>
        <Link
          href="/about"
          className="shrink-0 rounded-md border border-[var(--steel-line)] px-4 py-2 text-sm font-semibold text-foreground hover:bg-[var(--card-muted)]"
        >
          Read transfer playbook →
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {DEAL_ROWS.map((row) => (
          <div
            key={row.heading}
            className="rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] p-5"
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
              className="rounded-full border border-[var(--steel-line)] px-3 py-1 text-xs font-semibold text-foreground hover:border-[var(--gold-strong)] hover:text-gold"
            >
              {lane.pillLabel}
            </Link>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/marketplace" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          Browse transferable listings →
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
