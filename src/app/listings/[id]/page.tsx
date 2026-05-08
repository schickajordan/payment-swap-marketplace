import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import {
  ListingReviewsAggregatesJsonLd,
  ListingReviewsPanel,
} from "@/components/reviews/listing-reviews-panel";
import { ListingInquiryThreadPanel } from "@/components/messaging/listing-inquiry-thread-panel";
import { ListingDealChecklist } from "@/components/listings/listing-deal-checklist";
import { TransferPlaybookPanel } from "@/components/marketplace/transfer-playbook-panel";
import { ListingTrustSignals } from "@/components/trust/listing-trust-signals";
import { applyForSwapAction } from "@/app/buyer/actions";
import { getCanonicalSiteUrl, listingImageOgUrl, toAbsoluteOgImageUrl } from "@/lib/seo/site-url";
import { getCurrentSession } from "@/lib/auth/session";
import { getListingAssetsMapByListingIds } from "@/lib/listings/assets";
import { getListingForDetailPage, getActiveListingById } from "@/lib/listings/queries";
import { ensureListingInquiryThread, getMessagesForThread } from "@/lib/messaging/queries";
import { marketplaceQueryString } from "@/lib/marketplace/url";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";
import { dealTemplateLabel } from "@/lib/listings/deal-template";
import {
  averageListingRating,
  buyerCanSubmitListingReview,
  getListingReviewsForPublicListing,
} from "@/lib/reviews/queries";

function seoDealExtras(listing: {
  deal_template: "assumption" | "payment_swap_private" | "lease_to_own";
  collateral_is_titled: boolean;
}): { keywords: string[]; phrase: string } {
  const collateralKw = listing.collateral_is_titled ? "VIN titled equipment" : "serial number equipment lien";
  switch (listing.deal_template) {
    case "assumption":
      return {
        keywords: [collateralKw, "equipment loan assumption", "finance takeover heavy equipment"],
        phrase: "Lender-approved assumption lane.",
      };
    case "payment_swap_private":
      return {
        keywords: ["payment takeover equipment", "seller stays on loan equipment", collateralKw],
        phrase: "Private payment swap lane.",
      };
    case "lease_to_own":
      return {
        keywords: ["lease to own contractor equipment", "equipment installment payoff", collateralKw],
        phrase: "Lease-to-own lane.",
      };
  }
}

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; review?: string; message?: string }>;
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })}`;
}

function seoMoney(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export async function generateMetadata(props: Pick<ListingDetailPageProps, "params">): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const listing = await getActiveListingById(id);

    if (!listing) {
      return {
        title: "Listing",
      };
    }

    const base = getCanonicalSiteUrl();
    const canonical = `${base}/listings/${listing.id}`;
    const locationLabel = [listing.location_city, listing.location_state].filter(Boolean).join(", ") || "United States";

    let ogImageAbsolute: string;
    try {
      const assetsByListing = await getListingAssetsMapByListingIds([listing.id]);
      const firstImg = assetsByListing.get(listing.id)?.find((asset) => asset.asset_type === "image") ?? null;
      const primary =
        firstImg ? listingImageOgUrl(base, firstImg)
        : null;
      ogImageAbsolute =
        primary ??
        toAbsoluteOgImageUrl(base, "/marketing/hero-industrial-nightshift.png") ??
        `${base}/marketing/hero-industrial-nightshift.png`;
    } catch {
      ogImageAbsolute =
        toAbsoluteOgImageUrl(base, "/marketing/hero-industrial-nightshift.png") ??
        `${base}/marketing/hero-industrial-nightshift.png`;
    }

    const ogImages = [{ url: ogImageAbsolute }];

    const extras = seoDealExtras(listing);
    const keywords = Array.from(
      new Set([
        `${listing.category} rental`,
        `${listing.category} lease to own`,
        `${listing.category} marketplace`,
        listing.category,
        ...extras.keywords,
        "heavy equipment marketplace",
        "contractor asset rental",
        "payment swap marketplace",
      ])
    ).filter(Boolean);

    const mo = seoMoney(listing.monthly_payment_cents);
    const title = `${listing.title} · ${mo}/mo`;

    let reviews: Awaited<ReturnType<typeof getListingReviewsForPublicListing>>;
    try {
      reviews = await getListingReviewsForPublicListing(listing.id);
    } catch {
      reviews = [];
    }
    const avg = averageListingRating(reviews);
    const reviewClause =
      avg != null ?
        `${avg.toFixed(1)}★ (${reviews.length} verified-trade buyer review${reviews.length === 1 ? "" : "s"}). `
      : "";

    const description = `${listing.category}: ${listing.make ?? ""} ${listing.model ?? ""} • ${reviewClause}${extras.phrase} ${mo}/mo installment headline · ${locationLabel}. Escrow-ready agreements + Stripe Connect on Payment Swap Marketplace.`;

    const metadataObj: Metadata = {
      title,
      description: description.trim().slice(0, 160),
      keywords,
      alternates: {
        canonical,
      },
      openGraph: {
        type: "website",
        title,
        description: description.trim().slice(0, 200),
        url: canonical,
        images: ogImages,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description: description.trim().slice(0, 180),
        images: ogImages,
      },
      robots: { index: true, follow: true },
    };

    return metadataObj;
  } catch {
    return {
      title: "Listing · Payment Swap Marketplace",
    };
  }
}

export default async function ListingDetailPage({ params, searchParams }: ListingDetailPageProps) {
  const { id } = await params;
  const sp = await searchParams;

  let listing;
  try {
    listing = await getListingForDetailPage(id);
  } catch {
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const isPublished = listing.status === "active";

  const [assetsByListing, reviews, session] = await Promise.all([
    getListingAssetsMapByListingIds([listing.id]),
    getListingReviewsForPublicListing(listing.id).catch(() => []),
    getCurrentSession(),
  ]);

  const assets = assetsByListing.get(listing.id) ?? [];
  const { user } = session;
  const ownsListing = user?.id === listing.seller_id;
  const guest = !user;

  let canSubmitReview = false;
  if (user && !ownsListing && isPublished) {
    try {
      canSubmitReview = await buyerCanSubmitListingReview(listing.id, user.id);
    } catch {
      canSubmitReview = false;
    }
  }

  const canApply = !!user && !ownsListing && isPublished;

  const signInHref = signInUrlWithNext(`/listings/${listing.id}`);

  let inquiryThreadId: string | null = null;
  let inquiryMessages: Awaited<ReturnType<typeof getMessagesForThread>> = [];

  const canShowInquiry = !!user?.id && !ownsListing && isPublished;
  if (canShowInquiry && user?.id) {
    try {
      const thread = await ensureListingInquiryThread(listing.id, user.id);
      inquiryThreadId = thread.id;
      inquiryMessages = await getMessagesForThread(thread.id);
    } catch {
      inquiryThreadId = null;
      inquiryMessages = [];
    }
  }

  const returnToListing =
    inquiryThreadId !== null ?
      `${authRoutes.messages}?inquiry=${encodeURIComponent(inquiryThreadId)}`
    : `/listings/${listing.id}`;

  const canonicalListingUrl = `${getCanonicalSiteUrl()}/listings/${listing.id}`;

  return (
    <MarketingShell>
      {isPublished ?
        <ListingReviewsAggregatesJsonLd
          listingId={listing.id}
          listingTitle={listing.title}
          reviews={reviews}
          canonicalListingUrl={canonicalListingUrl}
        />
      : null}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 md:px-8 md:pt-8">
        <nav className="text-xs text-slate-500 md:text-sm" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/marketplace" className="text-gold hover:text-[#ffd14d]">
                Marketplace
              </Link>
            </li>
            <li aria-hidden className="text-slate-600">
              ›
            </li>
            <li>
              <Link
                href={`/marketplace${marketplaceQueryString({ category: listing.category, deal: listing.deal_template })}`}
                className="hover:text-gold"
              >
                {listing.category}
              </Link>
            </li>
            <li aria-hidden className="text-slate-600">
              ›
            </li>
            <li className="line-clamp-1 font-medium text-slate-400">{listing.title}</li>
          </ol>
        </nav>

        {sp.error ?
          <p className="mt-4 rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {sp.error}
          </p>
        : null}
        {sp.message === "inquiry-sent" ?
          <p className="mt-4 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
            Inquiry sent—the seller sees it instantly in Messages + their Seller dashboard.
          </p>
        : null}

        {!isPublished ?
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
            <strong className="font-semibold">Preview mode:</strong> this listing is{" "}
            <span className="uppercase">{listing.status.replace("_", " ")}</span> and is{" "}
            <strong>not visible in the public marketplace</strong> until our team publishes it. Buyers cannot apply yet.
          </div>
        : null}

        <div className="mt-6 grid gap-8 xl:grid-cols-[1fr,minmax(280px,340px)] xl:items-start">
          <article className="min-w-0 rounded-2xl border border-white/10 bg-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-wide text-gold">{listing.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{listing.title}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {listing.make ?? "—"} {listing.model ?? ""}{" "}
              {listing.model_year ? ` (${listing.model_year})` : ""}
            </p>

            <ListingTrustSignals listing={listing} />

            <ListingDealChecklist listing={listing} />

            <div className="mt-6 grid gap-3 text-sm text-slate-300 md:grid-cols-2 xl:hidden">
              <p>
                <span className="text-slate-500">Monthly</span>{" "}
                <span className="text-lg font-semibold text-white">
                  {centsToUsd(listing.monthly_payment_cents)}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Deposit</span> {centsToUsd(listing.deposit_cents)}
              </p>
              <p>
                <span className="text-slate-500">Location</span> {listing.location_city ?? "—"},{" "}
                {listing.location_state ?? "—"}
              </p>
              <p>
                <span className="text-slate-500">Term (est.)</span>{" "}
                {listing.remaining_term_months ?? "—"} mo
              </p>
              {listing.buyout_price_cents != null ?
                <p>
                  <span className="text-slate-500">Buyout option</span>{" "}
                  {centsToUsd(listing.buyout_price_cents)}
                </p>
              : null}
              <p>
                <span className="text-slate-500">Condition</span>{" "}
                {listing.condition_rating ?? "Not specified"}
              </p>
              <p className="md:col-span-2">
                <span className="text-slate-500">Swap lane</span>{" "}
                <span className="font-medium text-slate-100">{dealTemplateLabel(listing.deal_template)}</span>
                {listing.collateral_is_titled ?
                  <span className="text-slate-500"> · titled / VIN verification</span>
                : <span className="text-slate-500"> · serial / lien documentation path</span>}
              </p>
            </div>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Equipment details
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-200">{listing.description}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Media</h2>
            {assets.length > 0 ?
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {assets.map((asset) =>
                  asset.asset_type === "video" ? (
                    <a
                      key={asset.id}
                      href={asset.public_url ?? asset.storage_path}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-white/10 bg-[#091c3d] p-3 text-sm text-gold hover:bg-[#0c2450]"
                    >
                      Open video asset
                    </a>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={asset.id}
                      src={asset.public_url ?? asset.storage_path}
                      alt={`${listing.title} asset`}
                      className="h-48 w-full rounded-md object-cover"
                    />
                  )
                )}
              </div>
            : <div className="relative mt-3 overflow-hidden rounded-xl ring-1 ring-white/10">
                <div className="relative aspect-[16/9] max-h-[min(420px,48vh)] w-full min-h-[200px] bg-[#050b18] md:aspect-[2/1]">
                  <div
                    className="absolute inset-0 bg-cover bg-[center_60%] opacity-90"
                    style={{ backgroundImage: "url('/branding/hero-industrial-premium.svg')" }}
                    role="img"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050b18] via-transparent to-[#050b18]/30"
                    aria-hidden
                  />
                </div>
                <div className="flex flex-col gap-3 border-t border-white/10 bg-[#050b18]/80 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-300">
                    {ownsListing ?
                      "Your listing will look even stronger once you add site photos or walk-around video."
                    : "This seller has not attached photos yet—the terms above are still in force."}
                  </p>
                  {ownsListing ?
                    <Link
                      href={`/seller/listings/${listing.id}/media`}
                      className="shrink-0 rounded-md bg-gold px-4 py-2.5 text-center text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                    >
                      Add photos &amp; video
                    </Link>
                  : null}
                </div>
              </div>
            }
          </section>

          {canShowInquiry ?
            <ListingInquiryThreadPanel
              listingId={listing.id}
              threadId={inquiryThreadId}
              messages={inquiryMessages}
              returnTo={returnToListing}
            />
          : null}

          <ListingReviewsPanel
            listingId={listing.id}
            reviews={reviews}
            canSubmitReview={canSubmitReview}
            searchParamsHasSuccess={sp.review === "posted"}
          />

            <footer className="mt-10 border-t border-white/10 pt-6 xl:hidden">
              {ownsListing ?
                <p className="text-sm text-slate-400">This is your listing. Buyers can apply here.</p>
              : null}
              {guest ?
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-slate-300">Sign in to apply for this equipment swap.</p>
                  <Link
                    href={signInHref}
                    className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                  >
                    Sign in to apply
                  </Link>
                </div>
              : null}
              {canApply ?
                <div className="space-y-2">
                  <form action={applyForSwapAction} className="space-y-3">
                    <input type="hidden" name="listingId" value={listing.id} />
                    <input type="hidden" name="requireQualification" value="yes" />
                    <input type="hidden" name="returnTo" value={`/listings/${listing.id}`} />
                    <div className="grid gap-2 text-xs text-slate-300">
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="acknowledgeLenderApproval"
                          value="yes"
                          className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                        />
                        <span>I understand lender/lessor approval can still block transfer even after applying.</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="acknowledgeTransferRestrictions"
                          value="yes"
                          className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                        />
                        <span>I reviewed state / timing restrictions that may apply to this contract.</span>
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          name="acknowledgeFeeResponsibility"
                          value="yes"
                          className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                        />
                        <span>I agree transfer/application fee responsibility must be explicit in writing.</span>
                      </label>
                    </div>
                    <label className="block text-xs text-slate-400">
                      Transfer fee paid by
                      <select
                        name="transferFeeParty"
                        required
                        className="mt-1 w-full rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold md:max-w-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select one
                        </option>
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="split">Split</option>
                        <option value="negotiated">To be negotiated before paperwork</option>
                      </select>
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-md bg-gold px-5 py-2.5 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                      >
                        Apply for swap
                      </button>
                      <Link href="/buyer" className="text-sm text-gold hover:text-[#ffd14d]">
                        Open buyer dashboard
                      </Link>
                    </div>
                  </form>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    Applies under this listing’s lane: {dealTemplateLabel(listing.deal_template)} (
                    {listing.collateral_is_titled ? "titled / VIN" : "serial / UCC-style docs"} checklist in the PDP
                    above).
                  </p>
                </div>
              : null}
              {!guest && !canApply && !ownsListing ?
                <p className="text-sm text-slate-400">
                  Applications are unavailable for this listing (inactive or restricted).
                </p>
              : null}
            </footer>
          </article>

          <aside
            aria-label="Pricing and checkout"
            className="hidden min-w-0 space-y-5 rounded-2xl border border-white/15 bg-gradient-to-b from-[#091c3d] to-[#071733] p-6 shadow-lg shadow-black/30 xl:block xl:sticky xl:top-28"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">Buy box</p>
            <div className="border-b border-white/10 pb-4">
              <p className="text-xs text-slate-500">Estimated monthly headline</p>
              <p className="font-mono text-3xl font-bold text-white">
                {centsToUsd(listing.monthly_payment_cents)}
              </p>
              {listing.deposit_cents > 0 ?
                <p className="mt-2 text-xs text-slate-400">
                  Deposit {centsToUsd(listing.deposit_cents)}
                </p>
              : null}
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Ships near</span>
                <span className="text-right font-medium text-white">
                  {listing.location_city ?? "—"}, {listing.location_state ?? "—"}
                </span>
              </li>
              <li className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-2">
                <span className="text-slate-500">Swap lane</span>
                <span className="text-right font-medium text-white sm:max-w-[65%]">
                  {dealTemplateLabel(listing.deal_template)}
                  {listing.collateral_is_titled ? " · titled" : " · serial path"}
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Est. term</span>
                <span>{listing.remaining_term_months ?? "—"} mo</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-slate-500">Condition</span>
                <span>{listing.condition_rating ?? "—"}</span>
              </li>
            </ul>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Sellers receive payouts through Stripe Connect when onboarded; optional escrow affects split at checkout.
            </p>
            <div className="mt-4">
              <TransferPlaybookPanel dense />
            </div>

            {ownsListing ?
              <p className="text-sm text-slate-400">This is your listing—buyers submit applications here.</p>
            : null}
            {guest ?
              <Link
                href={signInHref}
                className="block rounded-md bg-gold py-3 text-center text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
              >
                Sign in to apply
              </Link>
            : null}
            {canApply ?
              <>
                <form action={applyForSwapAction} className="space-y-2">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="requireQualification" value="yes" />
                  <input type="hidden" name="returnTo" value={`/listings/${listing.id}`} />
                  <label className="flex items-start gap-2 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      name="acknowledgeLenderApproval"
                      value="yes"
                      className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                    />
                    <span>Lender/lessor approval may still block transfer.</span>
                  </label>
                  <label className="flex items-start gap-2 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      name="acknowledgeTransferRestrictions"
                      value="yes"
                      className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                    />
                    <span>I reviewed state / timing restrictions.</span>
                  </label>
                  <label className="flex items-start gap-2 text-[11px] text-slate-400">
                    <input
                      type="checkbox"
                      name="acknowledgeFeeResponsibility"
                      value="yes"
                      className="mt-0.5 rounded border-white/30 bg-[#091c3d]"
                    />
                    <span>I will confirm transfer fee responsibility in writing.</span>
                  </label>
                  <select
                    name="transferFeeParty"
                    required
                    defaultValue=""
                    className="w-full rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-xs text-white outline-none focus:border-gold"
                  >
                    <option value="" disabled>
                      Transfer fee paid by...
                    </option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="split">Split</option>
                    <option value="negotiated">Negotiated</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full rounded-md bg-gold py-3 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                  >
                    Apply for swap
                  </button>
                </form>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Lane: {dealTemplateLabel(listing.deal_template)}
                  {listing.collateral_is_titled ? " · titled" : " · serial path"}.
                </p>
                <Link
                  href="/buyer"
                  className="block text-center text-sm font-medium text-gold hover:text-[#ffd14d]"
                >
                  View buyer dashboard
                </Link>
              </>
            : null}
            {!guest && !canApply && !ownsListing ?
              <p className="text-sm text-slate-400">
                Applications are unavailable for this listing (inactive or restricted).
              </p>
            : null}
          </aside>
        </div>
      </main>
    </MarketingShell>
  );
}
