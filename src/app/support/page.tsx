import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import {
  getDemoBookingUrl,
  getHelpCenterUrl,
  getSupportEmail,
  supportMailtoHref,
} from "@/lib/config/support";
import { APP_NAME } from "@/lib/config/marketplace";
import { authRoutes } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Help & support",
  description: `Get help with ${APP_NAME}: deals, account, demos, and operator resources.`,
};

export default function SupportPage() {
  const email = getSupportEmail();
  const helpCenter = getHelpCenterUrl();
  const demoBooking = getDemoBookingUrl();

  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 md:px-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gold-strong)]">Help desk</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Help &amp; support
          </h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted md:text-base">
            Deal questions go through your agreement thread first. Use the channels below for account access, demos, and
            platform issues.
          </p>
        </header>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">While you&apos;re on a deal</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-muted">
            <li>
              Open{" "}
              <Link href={authRoutes.messages} className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                Messages
              </Link>{" "}
              — quote documents, lender questions, and inspection notes stay with the listing or agreement.
            </li>
            <li>
              Buyer tools:{" "}
              <Link href="/buyer" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                Buyer dashboard
              </Link>
              . Seller tools:{" "}
              <Link href="/seller" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                Seller dashboard
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Account &amp; billing</h2>
          <p className="mt-2 text-sm text-muted">
            Password, addresses, notifications, and Stripe Connect status:{" "}
            <Link href={authRoutes.account} className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
              Account hub
            </Link>
            . Published fees:{" "}
            <Link href="/pricing" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
              Pricing
            </Link>
            .
          </p>
          {email ?
            <p className="mt-4 text-sm text-muted">
              Email{" "}
              <a href={supportMailtoHref(email)} className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                {email}
              </a>{" "}
              for invoice or access issues your account page can&apos;t resolve.
            </p>
          : <p className="mt-4 rounded-md border border-amber-600/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-100/95">
              Operators: set <code className="rounded bg-black/40 px-1 font-mono">NEXT_PUBLIC_SUPPORT_EMAIL</code> in
              hosting so customers see a contact address here.
            </p>}
          {helpCenter ?
            <p className="mt-3 text-sm text-muted">
              Articles:{" "}
              <a
                href={helpCenter}
                className="font-semibold text-[var(--link)] underline-offset-2 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Help center
              </a>
            </p>
          : null}
        </section>

        <section id="demo" className="scroll-mt-24 rounded-xl border border-[var(--steel-line)] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Live demo / intro</h2>
          <p className="mt-2 text-sm text-muted">
            New here? Walk the product yourself, or book a short walkthrough with our team.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-[var(--card)]"
            >
              Product tour
            </Link>
            {demoBooking ?
              <a
                href={demoBooking}
                className="inline-flex rounded-md bg-[var(--gold)] px-4 py-2.5 text-sm font-bold !text-[#051b35] hover:brightness-105"
                rel={demoBooking.startsWith("http") ? "noopener noreferrer" : undefined}
                target={demoBooking.startsWith("http") ? "_blank" : undefined}
              >
                Book a demo
              </a>
            : null}
            <Link
              href={authRoutes.signUp}
              className="inline-flex rounded-md border border-[var(--gold-strong)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--gold-strong)] hover:bg-[var(--gold)]/10"
            >
              Create account
            </Link>
          </div>
          {!demoBooking ?
            <p className="mt-3 text-xs text-muted">
              Operators: add{" "}
              <code className="rounded bg-[var(--card-muted)] px-1 font-mono">NEXT_PUBLIC_DEMO_BOOKING_URL</code> (HTTPS
              scheduling link or <code className="rounded bg-[var(--card-muted)] px-1 font-mono">mailto:</code>) to
              enable the booking button.
            </p>
          : null}
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Operators &amp; engineers</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              Deploy &amp; config status:{" "}
              <Link href="/api/health" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                /api/health
              </Link>
            </li>
            <li>
              Security contact:{" "}
              <Link href="/.well-known/security.txt" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                /.well-known/security.txt
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                Privacy policy
              </Link>{" "}
              ·{" "}
              <Link href="/terms" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                Terms of service
              </Link>
            </li>
          </ul>
        </section>
      </main>
    </MarketingShell>
  );
}
