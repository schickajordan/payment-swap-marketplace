import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { DealTypesOverview } from "@/components/marketing/deal-types-overview";
import { StatCard } from "@/components/ui/stat-card";
import {
  HOME_HERO_LEAD,
  HOME_HERO_TITLE,
  INITIAL_FOCUS_CATEGORIES,
  MOAT_PILLARS,
  VISION_HEADLINE,
} from "@/lib/config/marketplace";
import { getActiveListings } from "@/lib/listings/queries";
import { marketplaceQueryString } from "@/lib/marketplace/url";
import { authRoutes } from "@/lib/navigation";

const signUpSeller = `${authRoutes.signUp}?role=seller`;

export const dynamic = "force-dynamic";

export default async function Home() {
  let activeListingsCount = 0;

  try {
    const listings = await getActiveListings(100);
    activeListingsCount = listings.length;
  } catch {
    activeListingsCount = 0;
  }

  return (
    <MarketingShell>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10 md:gap-12 md:px-8">
        <CinematicHero
          eyebrow={<>{VISION_HEADLINE}</>}
          title={<>{HOME_HERO_TITLE}</>}
          subtitle={
            <>
              <span className="mb-1 block rounded-md border border-white/25 bg-black/45 px-4 py-3 text-[15px] leading-snug text-white backdrop-blur-sm md:text-[1.05rem] md:leading-relaxed">
                {HOME_HERO_LEAD}
              </span>
            </>
          }
          aside={
            <div className="space-y-4 text-sm leading-snug">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-strong)]">
                Swap-desk standards
              </p>
              <ul className="space-y-3 text-[var(--foreground)]">
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--gold-strong)]">•</span>
                  <span>Sellers publish remaining payment, transfer fees, and lender constraints up front.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--gold-strong)]">•</span>
                  <span>Buyers submit qualification details once for a faster review cycle.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-[var(--gold-strong)]">•</span>
                  <span>Milestones control funding, handoff, and payout timing.</span>
                </li>
              </ul>
              <p className="border-t border-[var(--steel-line)] pt-4 text-xs text-[var(--muted)]">
                Need the full policy narrative? See{" "}
                <Link href="/about" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                  About & verification
                </Link>{" "}
                and{" "}
                <Link href="/pricing" className="font-semibold text-[var(--link)] underline-offset-2 hover:underline">
                  published fees
                </Link>
                .
              </p>
            </div>
          }
          ctas={
            <>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--gold)] px-5 py-3 text-sm font-bold !text-[#051b35] shadow-lg shadow-black/35 transition-[filter] hover:brightness-105 active:translate-y-px"
              >
                Browse swap listings
              </Link>
              <Link
                href={signUpSeller}
                className="rounded-md border-2 border-white bg-black/25 px-5 py-3 text-sm font-semibold !text-white shadow-sm shadow-black/40 backdrop-blur-sm transition-colors hover:border-white hover:bg-black/40 active:translate-y-px"
              >
                List inventory
              </Link>
              <Link
                href={authRoutes.signUp}
                className="rounded-md bg-white px-5 py-3 text-sm font-bold !text-[#051b35] transition-colors hover:bg-[#e8eef4] active:translate-y-px"
              >
                Create account
              </Link>
              <Link
                href="/pricing"
                className="rounded-md px-2 py-3 text-sm font-semibold !text-white underline-offset-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] hover:underline"
              >
                Fee schedule
              </Link>
            </>
          }
        />

        <DealTypesOverview />

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6 md:p-8" aria-labelledby="shop-by-category">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="shop-by-category" className="font-display text-xl font-bold text-foreground md:text-2xl">
              Browse by equipment class
            </h2>
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-[var(--link)] underline-offset-4 hover:underline"
            >
              Full marketplace →
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INITIAL_FOCUS_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/marketplace${marketplaceQueryString({ category: cat })}`}
                className="group rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-5 transition-colors hover:border-[var(--gold-strong)] hover:bg-[var(--card)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Category</p>
                <p className="mt-2 text-lg font-bold capitalize leading-snug text-foreground group-hover:text-gold">
                  {cat}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="marketplace-stats"
          className="grid gap-4 rounded-xl border border-[var(--steel-line)] bg-[var(--card)] p-6 shadow-[0_12px_40px_rgba(5,27,53,0.08)] md:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Market context"
            value="$100B+"
            description="Directional scale of heavy-equipment capital in service of serious buyers—not a forecast for this exchange."
          />
          <StatCard
            label="Live listings"
            value={String(activeListingsCount)}
            description="Equipment rows published and discoverable in this catalog today."
          />
          <StatCard
            label="Publication window"
            value="24–72 hrs"
            description="Typical listing review when verification materials keep pace—operations vary by queue."
          />
          <StatCard
            label="Operating principles"
            value="Documented"
            description="Lanes, fees, and responsibilities are written down before money moves—see Pricing and Legal."
          />
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-[var(--card)] p-6 shadow-[0_8px_28px_rgba(5,27,53,0.06)] md:p-8">
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">Why teams run deals here</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {MOAT_PILLARS.map((line) => (
              <li
                key={line}
                className="rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-3 text-sm font-medium leading-relaxed text-foreground"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 rounded-xl border border-[var(--steel-line)] bg-card p-6 md:scroll-mt-28 md:p-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">How a transfer works</h2>
          <ol className="mt-5 list-inside list-decimal space-y-3 text-sm font-medium leading-relaxed text-muted md:text-base">
            <li>Seller publishes with lane, payment terms, and required transfer conditions.</li>
            <li>Buyer qualifies; lender, insurer, and inspection items stay in one thread.</li>
            <li>Signed agreement triggers checkout and payout workflow.</li>
            <li>Milestones and records remain searchable for every authorized party.</li>
          </ol>
        </section>

        <section
          id="legal-overview"
          className="scroll-mt-24 rounded-xl border border-[var(--steel-line)] bg-card p-6 md:scroll-mt-28 md:p-8"
        >
          <h2 className="font-display text-xl font-bold text-foreground md:text-2xl">Legal posture</h2>
          <p className="mt-4 text-sm font-medium leading-relaxed text-muted md:text-base">
            Payment Swap Marketplace provides coordination tooling. Lenders, lessors, carriers, lienholders, and regulators are
            third parties unless your contracts bring them in explicitly. Obtain independent advice on DOT, OSHA, taxation,
            insurance, titling, and cross-border shipments.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/about#verification"
              className="rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card)]"
            >
              Verification
            </Link>
            <Link
              href="/pricing"
              className="rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card)]"
            >
              Pricing & fees
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
