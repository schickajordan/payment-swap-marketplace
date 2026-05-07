import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { TransferPlaybookPanel } from "@/components/marketplace/transfer-playbook-panel";
import { APP_NAME, SHARE_ECONOMY_ANCHOR } from "@/lib/config/marketplace";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { authRoutes } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "About us",
  description: `${APP_NAME} coordinates heavy-equipment lease assumptions, payment takeovers, and lease-to-own exits between verified businesses—documented milestones, not casual listings.`,
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-4 py-12 md:max-w-4xl md:px-8 md:py-14">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">About us</p>
          <h1 className="font-display text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
            Equipment payment transfers need disciplined execution built for contractor iron
          </h1>
          <p className="rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-3 text-lg font-medium leading-relaxed text-muted md:text-xl">
            {SHARE_ECONOMY_ANCHOR}
          </p>
          <p className="text-lg font-medium leading-relaxed text-muted md:text-xl">
            {APP_NAME} is intentionally narrow: we help principals advertise{" "}
            <span className="text-foreground">who owes what next month</span>,{" "}
            <span className="text-foreground">what lienholders require</span>, and{" "}
            <span className="text-foreground">how the handoff progresses</span>—rather than scattering those facts across SMS
            and voicemails.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={authRoutes.signUp}
              className="rounded-md bg-[var(--button-primary-bg)] px-5 py-3 text-sm font-semibold text-[var(--button-primary-fg)] shadow-lg shadow-black/15 hover:opacity-95"
            >
              Create your free business account
            </Link>
            <Link
              href="/marketplace"
              className="rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-foreground hover:border-[var(--gold-strong)] hover:bg-[var(--card-muted)]"
            >
              Preview the marketplace
            </Link>
          </div>
        </header>

        <section id="platform-edge" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Built for real equipment transfers—not casual listings</h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            Generic listing apps stop at lightweight search. Contractor deals need heavier rails—here is what already
            ships (or is actively wired) in this codebase:
          </p>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">Searchers:</strong> marketplace query spans title, category, description, make,
              model, and city—not just a headline string.
            </li>
            <li>
              <strong className="text-foreground">Saved filters:</strong> repeat metro × category combos persist locally so
              dispatchers jump straight back into the aisle they care about.
            </li>
            <li>
              <strong className="text-foreground">Listers:</strong> structured economics (monthly, deposit, term, buyout) render
              as hero numbers on cards; each listing picks one of three{" "}
              <strong className="text-foreground">swap lanes</strong> (lender-approved assumption, private payment takeover with
              seller on the note, or lease-to-own toward title) plus a titled-vs-serial verification path.
            </li>
            <li>
              <strong className="text-foreground">Admins:</strong> filterable verification queue, full listing preview (even
              before publish), agreement approvals, internal notes, and liquidity milestone feeds.
            </li>
            <li>
              <strong className="text-foreground">Buyers:</strong> dashboard surfaces applications, threaded comms, and installment
              checkout with retry paths—not a single static receipt screen.
            </li>
          </ul>
        </section>

        <section id="industry-benefit" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Why the industry needed another lane</h2>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">Search density:</strong> when categories are seeded regionally you can browse like a dealership shelf instead of shotgun Facebook posts.
            </li>
            <li>
              <strong className="text-foreground">Contracts + conversation together:</strong> lien questions, insurer notes, and inspection chatter stay anchored to each agreement—not lost in screenshots.
            </li>
            <li>
              <strong className="text-foreground">Payment discipline:</strong> optional installments, escrow-style collections for qualified sellers, and Stripe-backed checkout mean fewer “Venmo me later” dead ends—without pretending we’re your lender.
            </li>
            <li>
              <strong className="text-foreground">Business-only posture:</strong> every counterparty registers as part of an operating entity, aligning with heavier equipment realities.
            </li>
          </ul>
        </section>

        <section id="rent-lease-buy" className="space-y-6 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">How renting, leasing, or buying maps on the site</h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            Sellers publish the economic story—deposit, headline monthly obligation, payoff/buyout (when applicable), geography, inspection notes—and we display it cleanly on listing cards before you ping them. Buyers choose what matches their playbook:
          </p>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Rent-style workflows",
                text: "You need uptime for a sprint of work—monthly occupancy with return or renewal spelled out upfront. Agreements center on timelines and predictable outflows versus surprise balloon fees.",
              },
              {
                title: "Lease / structured installments",
                text: "You want to walk toward equity or payoff over time—the classic deposit + amortized installments + optional buyout that banks already understand.",
              },
              {
                title: "Buy / payoff bursts",
                text: "You’re ready for a lump payoff or negotiated purchase after the installments satisfy contract language—still documented on-platform.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-lg border border-[var(--steel-line)] bg-card p-5">
                <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="text-sm text-muted">
            Every listing exposes the headline numbers—you’re never guessing whether something is strictly rental-ish vs ownership-bound.
          </p>
          <div className="rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gold">Browse by swap lane</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              The marketplace filter rail matches how ops thinks about deals—jump straight into the paperwork flavor you’re
              hunting:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
              {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
                <li key={lane.deal}>
                  <Link href={lane.href} className="font-semibold text-gold hover:text-[#ffd14d]">
                    {lane.longLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="your-account" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Setting up your business account</h2>
          <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">
                Tap{" "}
                <Link href={authRoutes.signUp} className="text-gold underline hover:text-[#ffd14d]">
                  Create account
                </Link>
              </strong>{" "}
              in the top navigation—or use the golden button anywhere on marketing pages—and choose Buyer or Seller. Admins onboard separately.
            </li>
            <li>
              <strong className="text-foreground">Confirm your email:</strong> we send verification through Supabase Auth (check spam). Until this completes, dashboards stay locked-down.
            </li>
            <li>
              <strong className="text-foreground">Sellers outline equipment:</strong> from the Seller dashboard you mint listings, attach photos/videos, and submit for ops review prior to appearing publicly.
            </li>
            <li>
              <strong className="text-foreground">Payout readiness:</strong> when you intend to collect through the platform rails, Stripe Connect onboarding unlocks ACH/card payouts without us storing PAN data.
            </li>
            <li>
              <strong className="text-foreground">Buyers negotiate + pay:</strong> save threads, track agreements, trigger checkout flows once both sides feel comfortable.
            </li>
          </ol>
          <Link href="/pricing" className="inline-flex text-sm font-semibold text-gold hover:text-[#ffd14d]">
            See how fees stack before you publish →
          </Link>
        </section>

        <section id="verification" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">How verification & review actually work</h2>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">Business-only accounts:</strong> sign-up enforces company intent; consumer garage-sale volume isn’t the target.
            </li>
            <li>
              <strong className="text-foreground">Listing review:</strong> new or flagged listings pass through internal ops for obvious fraud, unsafe claims, or missing disclosures before they flip to public.
            </li>
            <li>
              <strong className="text-foreground">Identity & payout checks:</strong> Stripe handles KYC/identity for Connect-enabled sellers so we’re not custodians of their banking credentials.
            </li>
            <li>
              <strong className="text-foreground">Paper trail by design:</strong> messaging, admin notes, and payment events stay attached to records so everyone can reconstruct the deal later.
            </li>
          </ul>
          <p className="text-sm text-muted">
            We’re facilitators, not regulators—liens, titles, permits, and loans still belong to your counsel, lender, and DOT partners.
          </p>
        </section>

        <section id="walkthrough" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">End-to-end in plain English</h2>
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>Browse searchable inventory with geography + category cues.</li>
            <li>Engage sellers through guarded threads capturing inspections, lien chatter, insurer docs.</li>
            <li>Ops blesses contractual packages when escalation required.</li>
            <li>Checkout + installments obey the rules baked into Stripe when live.</li>
            <li>Distributions reconcile to onboarding status for each seller wallet.</li>
          </ol>
          <Link href="/#how-it-works" className="inline-flex text-sm font-semibold text-gold hover:text-[#ffd14d]">
            Compare with the abbreviated timeline on the home page →
          </Link>
        </section>

        <section id="transfer-playbook" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">What serious transfer workflows emphasize</h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            Credit screening, lessor approval, transfer-fee clarity, and realistic timing. We use the same priorities so
            equipment swaps stay honest from day one.
          </p>
          <TransferPlaybookPanel />
        </section>

        <section id="cta" className="rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-6 text-center md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Start now</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">
            Open an account or browse inventory first.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={authRoutes.signUp}
              className="rounded-md bg-[var(--button-primary-bg)] px-6 py-3 text-sm font-semibold text-[var(--button-primary-fg)] hover:opacity-95"
            >
              Create account
            </Link>
            <Link
              href={authRoutes.signIn}
              className="rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-foreground hover:border-[var(--gold-strong)] hover:bg-[var(--card-muted)]"
            >
              Sign in
            </Link>
            <Link
              href="/marketplace"
              className="rounded-md border border-transparent px-6 py-3 text-sm font-semibold text-muted hover:text-[var(--gold-strong)]"
            >
              Browse listings
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
