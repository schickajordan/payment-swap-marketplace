import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { getDemoBookingUrl, getSupportEmail, supportMailtoHref } from "@/lib/config/support";
import { APP_NAME } from "@/lib/config/marketplace";
import { authRoutes } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Product tour & demo",
  description: `See how ${APP_NAME} works for buyers, sellers, and operations—browse inventory or book a walkthrough.`,
};

const TOUR_STEPS = [
  {
    title: "Inventory & lanes",
    body: "Open the marketplace, filter by swap lane and equipment class, and compare monthly headlines before you apply.",
  },
  {
    title: "Listing & media",
    body: "Sellers publish terms, collateral, and inspection context; upload media from the seller dashboard when ready.",
  },
  {
    title: "Deal room",
    body: "Buyer qualification and seller disclosures stay in one thread with milestones—fewer email chains and screenshot archaeology.",
  },
  {
    title: "Agreements & payments",
    body: "Signed agreements unlock scheduled installments with Stripe Connect when your workspace is fully configured.",
  },
] as const;

export default function DemoPage() {
  const demoBooking = getDemoBookingUrl();
  const email = getSupportEmail();

  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 md:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)]">Demo</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Product tour
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted md:text-base">
            There isn&apos;t a separate &quot;sandbox tenant&quot; yet—use a real business account on your staging or production URL,
            or book time with us for a guided pass.
          </p>
        </header>

        <ol className="space-y-4">
          {TOUR_STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-xl border border-[var(--steel-line)] bg-card p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--gold-strong)]">
                Step {i + 1}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <section className="flex flex-wrap gap-3 rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-6">
          <Link
            href="/marketplace"
            className="inline-flex rounded-md bg-[var(--gold)] px-4 py-2.5 text-sm font-bold !text-[#051b35] hover:brightness-105"
          >
            Browse marketplace
          </Link>
          <Link
            href={authRoutes.signUp}
            className="inline-flex rounded-md border border-[var(--steel-line)] bg-[var(--card)] px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-[var(--card-muted)]"
          >
            Create account
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
