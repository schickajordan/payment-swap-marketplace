import type { Metadata } from "next";
import Link from "next/link";
import { MarketplaceCard } from "@/components/listings/marketplace-card";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { DEMO_MARKETPLACE_LISTINGS, DEMO_SELLER_FIELD_GUIDE } from "@/lib/demo/demo-listings";
import { getDemoBookingUrl, getSupportEmail, supportMailtoHref } from "@/lib/config/support";
import { APP_NAME } from "@/lib/config/marketplace";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Product tour & demo",
  description: `Walk through listing equipment and completing a swap on ${APP_NAME}—sample catalog cards and seller checklist.`,
};

const PROCESS_STEPS = [
  {
    title: "Create a seller account",
    body: "Register with your business email, confirm your inbox link, then open the Seller dashboard. That’s the staging area for drafts and submissions.",
    href: authRoutes.signUp,
    cta: "Start registration",
  },
  {
    title: "Fill out the listing form",
    body: "One screen captures the numbers buyers compare first: monthly headline, deposit, term, condition, and the deal lane that matches your paperwork.",
    href: signInUrlWithNext("/seller"),
    cta: "Sign in to list",
  },
  {
    title: "Add photos or video",
    body: "After you save a listing, upload media from the listing’s media page so ops and buyers can see condition before anyone messages you.",
    href: "/about#verification",
    cta: "How review works",
  },
  {
    title: "Operations publishes it",
    body: "New submissions stay private until marketplace operations clears them. Then your card goes live in the equipment catalog with the same layout as the samples below.",
    href: "/marketplace",
    cta: "See live catalog",
  },
  {
    title: "Buyers message and apply",
    body: "Qualified buyers thread on the listing, request documents, and move into an agreement when everyone is comfortable.",
    href: authRoutes.messages,
    cta: "Open messages",
  },
  {
    title: "Sign and fund",
    body: "Executed agreements unlock scheduled payments and Connect payouts when your workspace’s payment stack is fully turned on.",
    href: "/pricing",
    cta: "Read fees",
  },
] as const;

export default function DemoPage() {
  const demoBooking = getDemoBookingUrl();
  const email = getSupportEmail();

  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)]">Demo</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Product tour — list equipment, end to end
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted md:text-base">
            The samples below use the same cards as the real marketplace. Follow the numbered path to see how a seller
            moves from blank form to live inventory—no separate sandbox required.
          </p>
        </header>

        <section
          id="buyer-preview"
          className="scroll-mt-24 mt-12 rounded-2xl border border-white/10 bg-[#070f24] px-4 py-8 md:px-8 md:py-10"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-xl font-bold text-white md:text-2xl">What buyers see in the catalog</h2>
            <p className="mt-2 text-sm text-slate-400">
              Three fictitious units illustrate monthly headline, lane badge, location, and trust chips. Live listings
              look identical once operations approves yours.
            </p>
          </div>
          <div className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_MARKETPLACE_LISTINGS.map((listing) => (
              <MarketplaceCard key={listing.id} listing={listing} demoPreview />
            ))}
          </div>
        </section>

        <section
          id="seller-walkthrough"
          className="scroll-mt-24 mt-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-slate-900 shadow-sm md:px-10 md:py-12"
        >
          <h2 className="text-center text-xl font-bold text-slate-900 md:text-2xl">
            Seller walkthrough (plain English)
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-slate-600">
            Work top to bottom—the dashboard mirrors this order so you always know what comes next.
          </p>
          <ol className="mx-auto mt-8 max-w-3xl space-y-4">
            {PROCESS_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-sm font-bold text-[#071733]">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  <Link
                    href={step.href}
                    className="mt-3 inline-flex text-sm font-semibold text-[#0a4d8c] underline-offset-2 hover:underline"
                  >
                    {step.cta} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="field-guide"
          className="scroll-mt-24 mt-12 rounded-2xl border border-[var(--steel-line)] bg-card px-4 py-8 md:px-8"
        >
          <h2 className="text-lg font-semibold text-foreground md:text-xl">Listing form field guide</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Each row below matches a field on the seller “Create equipment listing” form—use it while you type so
            buyers—and ops—get exactly what they need.
          </p>
          <dl className="mt-6 divide-y divide-[var(--steel-line)] rounded-xl border border-[var(--steel-line)]">
            {DEMO_SELLER_FIELD_GUIDE.map((row) => (
              <div key={row.field} className="grid gap-1 px-4 py-3 md:grid-cols-[minmax(0,220px)_1fr] md:gap-6 md:py-4">
                <dt className="text-sm font-semibold text-foreground">{row.field}</dt>
                <dd className="text-sm leading-relaxed text-muted">{row.tip}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-6">
          <Link
            href="/marketplace"
            className="inline-flex rounded-md bg-[var(--gold)] px-4 py-2.5 text-sm font-bold !text-[#051b35] hover:brightness-105"
          >
            Browse live marketplace
          </Link>
          <Link
            href={authRoutes.signUp}
            className="inline-flex rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-[var(--card-muted)]"
          >
            Create seller account
          </Link>
          {demoBooking ?
            <a
              href={demoBooking}
              className="inline-flex rounded-md border border-[var(--gold-strong)]/60 bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--gold-strong)] hover:bg-[var(--gold)]/10"
              rel={demoBooking.startsWith("http") ? "noopener noreferrer" : undefined}
              target={demoBooking.startsWith("http") ? "_blank" : undefined}
            >
              Book a live demo
            </a>
          : email ?
            <a
              href={supportMailtoHref(email)}
              className="inline-flex rounded-md border border-[var(--gold-strong)]/60 bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-[var(--gold-strong)] hover:bg-[var(--gold)]/10"
            >
              Request a walkthrough
            </a>
          : null}
          <Link href="/support" className="inline-flex items-center px-2 py-2.5 text-sm font-semibold text-[var(--link)] underline-offset-2 hover:underline">
            Help &amp; support →
          </Link>
        </section>
      </main>
    </MarketingShell>
  );
}
