import Link from "next/link";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { CinematicHero } from "@/components/marketing/cinematic-hero";
import { DealTypesOverview } from "@/components/marketing/deal-types-overview";
import { StatCard } from "@/components/ui/stat-card";
import {
  INITIAL_FOCUS_CATEGORIES,
  LIQUIDITY_WEDGE_LINE,
  MOAT_PILLARS,
  MOAT_WEDGE_LINE,
  NORTH_STAR_LIQUIDITY,
  NORTH_STAR_MOAT,
  SHARE_ECONOMY_ANCHOR,
  VISION_HEADLINE,
} from "@/lib/config/marketplace";
import { getActiveListings } from "@/lib/listings/queries";
import { marketplaceQueryString } from "@/lib/marketplace/url";
import { authRoutes } from "@/lib/navigation";

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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10 md:gap-14 md:px-8 lg:gap-16">
        <CinematicHero
          eyebrow={<>{VISION_HEADLINE}</>}
          title={<>Rent, lease, or buy heavy equipment—one marketplace with the numbers up front.</>}
          subtitle={
            <>
              <span className="mb-3 block rounded-lg border border-gold/20 bg-black/35 px-4 py-3 text-sm font-medium leading-relaxed text-slate-50 md:text-base">
                {SHARE_ECONOMY_ANCHOR}
              </span>
              Shop like a normal catalog, but with business guts: searchable iron, secure checkout when you&apos;re ready,
              and rent / installment / payoff lanes spelled per listing—not buried in voicemail. Conversations stay tied to
              each deal so inspectors, partners, and your team see the same story.
              <span className="mt-4 block text-xs leading-relaxed text-premium-muted md:text-sm">{LIQUIDITY_WEDGE_LINE}</span>
              <span className="mt-2 block text-xs leading-relaxed text-premium-muted md:text-sm">{MOAT_WEDGE_LINE}</span>
            </>
          }
          aside={
            <div className="space-y-5 text-sm text-foreground">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Why people use us</p>
              <ul className="space-y-3 text-sm leading-snug">
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-gold">1</span>
                  <span>Listings reviewed by ops when needed—pricing and terms shouldn’t feel like guessing games.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-gold">2</span>
                  <span>Payments and installments use trusted card processing; sellers can get paid on platform rails when enabled.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-gold">3</span>
                  <span>Designed for phones on the hood of a pickup—readable at a glance, easy to tap through.</span>
                </li>
              </ul>
              <div className="rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-3 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-foreground">Built for crews and yards</span>
                Owner-operators, small fleets, and dealers who need listings, paperwork, payouts, and support in one
                place—not five apps and a spreadsheet.
              </div>
            </div>
          }
          ctas={
            <>
              <Link
                href="/marketplace"
                className="rounded-md bg-gold px-5 py-3 text-sm font-semibold text-[#071733] shadow-[0_20px_50px_-20px_rgba(242,183,5,0.7)] transition-colors hover:bg-[#ffd14d] active:translate-y-[1px]"
              >
                Browse equipment
              </Link>
              <Link
                href="/seller"
                className="rounded-md border border-white/35 bg-black/35 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:border-gold/50 hover:bg-white/10 active:translate-y-[1px]"
              >
                List what you&apos;re selling
              </Link>
              <Link
                href={authRoutes.signUp}
                className="rounded-md border border-gold/55 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
              >
                Create account
              </Link>
              <Link
                href="/about"
                className="rounded-md px-2 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-gold"
              >
                About us →
              </Link>
              <Link
                href="/pricing"
                className="rounded-md px-2 py-3 text-sm font-semibold text-slate-300 transition-colors hover:text-gold"
              >
                Fees →
              </Link>
            </>
          }
        />

        <section className="rounded-2xl border border-[var(--steel-line)] bg-[var(--charcoal-panel)] p-6 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Enterprise-ready storefront</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground md:text-3xl">
                Built to look public-market serious on day one
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">
                Clean category rails, documented swap lanes, and operation-grade checkpoints so buyers, sellers, and
                admins work from one version of the truth.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/marketplace"
                className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/20"
              >
                Open marketplace
              </Link>
              <Link
                href="/about#transfer-playbook"
                className="rounded-md border border-[var(--steel-line)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card-muted)]"
              >
                Transfer playbook
              </Link>
              <Link
                href="/pricing"
                className="rounded-md border border-[var(--steel-line)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card-muted)]"
              >
                Pricing clarity
              </Link>
            </div>
          </div>
        </section>

        <DealTypesOverview />

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6 md:p-8" aria-labelledby="shop-by-category">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="shop-by-category" className="text-xl font-bold text-foreground">
              Shop by category
            </h2>
            <Link
              href="/marketplace"
              className="text-sm font-semibold text-gold transition-colors hover:text-[#ffd14d]"
            >
              See all →
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {INITIAL_FOCUS_CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/marketplace${marketplaceQueryString({ category: cat })}`}
                className="group rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] p-5 transition-colors hover:border-gold/35 hover:bg-[var(--card)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Browse</p>
                <p className="mt-2 text-lg font-bold capitalize leading-snug text-foreground group-hover:text-gold">{cat}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground">Equipment we’re focused on now</h2>
          <p className="mt-3 max-w-3xl text-sm text-muted md:text-base">
            We concentrate on categories where listings stack up fastest—starting with skid steers, trailers, mini
            excavators, and dump trucks—before we widen into everything else contractors run.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {INITIAL_FOCUS_CATEGORIES.map((c) => (
              <li
                key={c}
                className="rounded-full border border-gold/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-gold"
              >
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gold/20 bg-[var(--charcoal-panel)] p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground">What we optimize for behind the scenes</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            First: listings that convert to real conversations and deposits. Second: tools that keep money movement and
            paperwork above board for everyone involved.
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-[var(--steel-line)] bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Healthy marketplace rhythm</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">{NORTH_STAR_LIQUIDITY.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{NORTH_STAR_LIQUIDITY.definition}</p>
              <p className="mt-3 text-xs text-muted opacity-90">{NORTH_STAR_LIQUIDITY.why}</p>
            </div>
            <div className="rounded-lg border border-[var(--steel-line)] bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Peace of mind on money & messages</p>
              <h3 className="mt-2 text-lg font-bold text-foreground">{NORTH_STAR_MOAT.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{NORTH_STAR_MOAT.definition}</p>
              <p className="mt-3 text-xs text-muted opacity-90">{NORTH_STAR_MOAT.why}</p>
            </div>
          </div>
        </section>

        <section id="marketplace-stats" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Industry scale (for context)"
            value="$100B+"
            description="Rough napkin math on idle heavy-equipment capital in North America—not a prediction about this marketplace."
          />
          <StatCard
            label="Active listings here"
            value={String(activeListingsCount)}
            description="Pieces of equipment shoppers can browse right now on this marketplace."
          />
          <StatCard
            label="Typical onboarding window"
            value="24–72 hrs"
            description="Publishing and first messages often land in this range when verification keeps up—not a guaranteed SLA."
          />
          <StatCard
            label="Ways the platform earns fees"
            value="7+"
            description="Publishing, swaps, escrow help, optional services for dealers—all broken out plainly on Pricing."
          />
          <StatCard
            label="What makes us sticky"
            value="Trust & follow-through"
            description="Pictures help, but people stay when installments, escrow help, timelines, inspections, and support feel dependable."
          />
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground">Different from Craigslist vibes or rental-only catalogs</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">What you often find today</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>Lease-marketplaces glued to passenger cars—not heavy iron.</li>
                <li>Big rental fleets built for counters, not the owner texting from the cab.</li>
                <li>Peer-to-peer chatter with no disciplined payout path.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">What we stitch into one workflow</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>Regional inventory dense enough that search feels worth it.</li>
                <li>Rentals, lease-to-own routes, or payment swaps on one business-friendly storefront.</li>
                <li>Buyers, sellers, and backers steered toward clear agreements instead of orphaned texts.</li>
                <li>Installments and payouts wired in now—with room for GPS/telematics later without rebuilding from scratch.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--steel-line)] bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground">Beyond the listings grid</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {MOAT_PILLARS.map((line) => (
              <li
                key={line}
                className="rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-3 text-sm text-foreground"
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
          <h2 className="text-xl font-bold text-foreground">How it works</h2>
          <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-muted md:text-base">
            <li>Seller publishes equipment—we review flagged listings.</li>
            <li>Buyer engages; inspection notes, lien questions, insurer docs stay in one thread tied to that deal.</li>
            <li>When paperwork checks out, payment plans spin up automatically from the approved contract.</li>
            <li>Buyers check out securely on the platform; sellers receive payouts matching their onboarding and escrow settings.</li>
          </ol>
        </section>

        <section
          id="legal-overview"
          className="scroll-mt-24 rounded-xl border border-[var(--steel-line)] bg-card p-6 md:scroll-mt-28 md:p-8"
        >
          <h2 className="text-xl font-bold text-foreground">Legal & responsibilities</h2>
          <p className="mt-4 text-sm text-muted md:text-base">
            Payment Swap Marketplace helps businesses coordinate—not replace your banker, lienholder, DOT office, OSHA
            adviser, insurer, or attorney. Transparent timelines simply make it easier for everyone to reconstruct what was
            said and promised if questions come up later.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/about#verification"
              className="rounded-md border border-[var(--steel-line)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card-muted)]"
            >
              Verification details
            </Link>
            <Link
              href="/messages"
              className="rounded-md border border-[var(--steel-line)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground hover:bg-[var(--card-muted)]"
            >
              Messaging workflow
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
