import Link from "next/link";
import { Suspense } from "react";
export { metadata } from "./metadata";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { MarketplaceFiltersAside } from "@/components/marketplace/marketplace-filters-aside";
import { SavedMarketplaceSearchesToolbar } from "@/components/marketplace/saved-searches-toolbar";
import { MarketplaceCard } from "@/components/listings/marketplace-card";
import { getListingAssetsMapByListingIds } from "@/lib/listings/assets";
import { dealTemplateLabel, parseMarketplaceDealFilter } from "@/lib/listings/deal-template";
import type { MarketplaceSort } from "@/lib/listings/queries";
import { getMarketplaceListings, sanitizeListingSearch } from "@/lib/listings/queries";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { marketplaceQueryString } from "@/lib/marketplace/url";
import type { Database } from "@/lib/supabase/database.types";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type MarketplacePageProps = {
  searchParams: Promise<{ q?: string; state?: string; category?: string; deal?: string; sort?: string }>;
};

function parseSort(raw: string | undefined): MarketplaceSort {
  if (raw === "price_low" || raw === "price_high") return raw;
  return "newest";
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const q = sanitizeListingSearch(params.q ?? "") || undefined;
  const state = sanitizeListingSearch(params.state ?? "").toUpperCase().slice(0, 2) || undefined;
  const category = sanitizeListingSearch(params.category ?? "").slice(0, 80) || undefined;
  const deal = parseMarketplaceDealFilter(sanitizeListingSearch(params.deal ?? "").toLowerCase());
  const sort = parseSort(params.sort);

  let listings: ListingRow[] = [];
  try {
    listings = await getMarketplaceListings({
      q,
      state: state?.length === 2 ? state : undefined,
      category,
      deal,
      sort,
      limit: 48,
    });
  } catch {
    listings = [];
  }
  const assetsByListing = await getListingAssetsMapByListingIds(listings.map((l) => l.id));

  return (
    <MarketingShell catalogSearchDefault={q ?? ""}>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <MarketplaceFiltersAside q={q} category={category} state={state} deal={deal} sort={sort} />

          <div className="min-w-0 flex-1 space-y-6">
            <Suspense fallback={null}>
              <SavedMarketplaceSearchesToolbar />
            </Suspense>
            <header className="border-b border-white/10 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Equipment catalog
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Use the sidebar for <span className="text-slate-200">swap lane</span>, category, and state; sort by monthly
                headline or newest—all in plain view.
              </p>
              {deal ?
                <p className="mt-2 text-xs font-medium text-emerald-100/95">
                  Active lane: {dealTemplateLabel(deal)}{" "}
                  <Link
                    href={`/marketplace${marketplaceQueryString({
                      q,
                      state: state?.length === 2 ? state : undefined,
                      category,
                      sort: sort !== "newest" ? sort : undefined,
                    })}`}
                    className="ml-1 font-normal underline decoration-emerald-500/60 underline-offset-2 hover:text-white"
                  >
                    Clear lane only
                  </Link>
                </p>
              : null}
              <p className="mt-3 text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-300">{listings.length}</span> results
              </p>
            </header>

            <div className="flex flex-wrap items-end gap-3">
              <form className="flex flex-wrap items-center gap-2" method="get" action="/marketplace">
                {q ? <input type="hidden" name="q" value={q} /> : null}
                {state ? <input type="hidden" name="state" value={state} /> : null}
                {category ? <input type="hidden" name="category" value={category} /> : null}
                {deal ? <input type="hidden" name="deal" value={deal} /> : null}
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="text-slate-500">Sort by</span>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white focus:border-gold"
                  >
                    <option value="newest">Featured &amp; newest</option>
                    <option value="price_low">Price: low to high</option>
                    <option value="price_high">Price: high to low</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                >
                  Go
                </button>
              </form>

              <form className="ml-auto flex flex-1 flex-wrap gap-2 md:min-w-[280px] md:max-w-md" method="get" action="/marketplace">
                {category ? <input type="hidden" name="category" value={category} /> : null}
                {deal ? <input type="hidden" name="deal" value={deal} /> : null}
                {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
                <label className="sr-only" htmlFor="marketplace-state-inline">
                  Ship to state
                </label>
                <input
                  id="marketplace-state-inline"
                  name="state"
                  defaultValue={state ?? ""}
                  placeholder="State code"
                  maxLength={2}
                  className="w-20 rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-center text-sm uppercase text-white"
                />
                <input
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Search in results…"
                  className="min-w-0 flex-1 rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white"
                />
                <button
                  type="submit"
                  className="rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Update
                </button>
              </form>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.length === 0 ?
                <div className="col-span-full rounded-xl border border-white/10 bg-card p-10 text-center">
                  <p className="text-lg font-semibold text-white">No matches in this aisle</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Loosen filters, clear the two-letter state chip, or reset search—then save any combo you repeat
                    weekly using <span className="font-semibold text-slate-200">Save current filters</span> above.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
                      <Link
                        key={lane.deal}
                        href={`/marketplace${marketplaceQueryString({
                          q,
                          category,
                          state: state?.length === 2 ? state : undefined,
                          deal: lane.deal,
                          sort: sort !== "newest" ? sort : undefined,
                        })}`}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200 hover:border-gold/40 hover:text-gold"
                      >
                        Try {lane.pillLabel}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/marketplace"
                    className="mt-6 inline-block rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                  >
                    Browse all inventory
                  </Link>
                </div>
              : listings.map((listing) => (
                  <MarketplaceCard
                    key={listing.id}
                    listing={listing}
                    thumbnailUrl={assetsByListing.get(listing.id)?.[0]?.public_url ?? undefined}
                  />
                ))
              }
            </div>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
