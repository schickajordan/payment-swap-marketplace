import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { APP_NAME } from "@/lib/config/marketplace";
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
            What this site does and how to use it
          </h1>
          <p className="rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-3 text-base font-medium leading-relaxed text-foreground md:text-lg">
            <strong>Business accounts only.</strong> {APP_NAME} is designed for verified business counterparties
            handling equipment payment transfers. It is not intended for consumer marketplace use.
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

        <section id="what-this-site-is" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">What this site is</h2>
          <p className="text-sm leading-relaxed text-muted md:text-base">
            {APP_NAME} helps businesses list equipment deals with clear payment terms, communicate in one thread, and
            document transfer milestones in a way both sides can track.
          </p>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">For buyers:</strong> browse listings by category, location, and deal
              structure before reaching out.
            </li>
            <li>
              <strong className="text-foreground">For sellers:</strong> publish monthly payment, deposit, and term data
              so buyers see key numbers immediately.
            </li>
            <li>
              <strong className="text-foreground">For operations teams:</strong> keep listing review, agreement status,
              and milestone notes in one system.
            </li>
            <li>
              <strong className="text-foreground">For everyone:</strong> messages, payment status, and agreement events
              stay attached to the same deal context.
            </li>
          </ul>
        </section>

        <section id="how-to-use" className="space-y-6 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">How to use the site</h2>
          <ol className="list-decimal space-y-4 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">Create a business account:</strong> register as Buyer or Seller and
              verify your email.
            </li>
            <li>
              <strong className="text-foreground">Browse or list equipment:</strong> buyers search inventory while
              sellers publish terms and details.
            </li>
            <li>
              <strong className="text-foreground">Use in-app messages:</strong> keep questions, documents, and updates
              attached to the same deal.
            </li>
            <li>
              <strong className="text-foreground">Review and execute agreement steps:</strong> track checkpoints before
              money or possession moves.
            </li>
            <li>
              <strong className="text-foreground">Complete payment workflow:</strong> approved deals continue through the
              configured platform rails.
            </li>
          </ol>
          <div className="rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gold">Browse by deal lane</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Start with the deal lane that matches your paperwork:
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

        <section id="business-only" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Who should use this site</h2>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>
              <strong className="text-foreground">Intended users:</strong> contractors, fleets, equipment owners,
              business buyers, and operations teams.
            </li>
            <li><strong className="text-foreground">Not intended for consumers:</strong> personal buying/selling use cases.</li>
            <li><strong className="text-foreground">Business verification required:</strong> accounts are managed as company users.</li>
          </ul>
          <p className="text-sm text-muted">
            We provide coordination tools, not legal/financial advice. Lien, title, insurance, and regulatory decisions
            should be handled by your authorized advisors and counterparties.
          </p>
        </section>

        <section id="privacy-and-agreements" className="space-y-4 scroll-mt-28">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">Privacy and agreement information</h2>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted md:text-base">
            <li>Terms and Privacy pages are public so business users can review policy before registering.</li>
            <li>Acceptance records are private and stored with version + timestamp on authenticated profiles.</li>
            <li>Deal-specific agreement files and related records are private to authorized users and operations support.</li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/terms" className="rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-foreground hover:bg-[var(--card-muted)]">
              Terms of Service
            </Link>
            <Link href="/privacy" className="rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-4 py-2 text-sm font-semibold text-foreground hover:bg-[var(--card-muted)]">
              Privacy Policy
            </Link>
          </div>
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
