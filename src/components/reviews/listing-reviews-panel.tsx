import { submitListingReviewAction } from "@/app/listings/[id]/review-actions";
import { averageListingRating, type ListingReviewRow } from "@/lib/reviews/queries";

function StarsRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-sm text-gold" role="img" aria-label={`${rating} stars out of five`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function ListingReviewsAggregatesJsonLd(props: {
  listingId: string;
  listingTitle: string;
  reviews: ListingReviewRow[];
  canonicalListingUrl: string;
}) {
  const avg = averageListingRating(props.reviews);
  if (props.reviews.length === 0 || avg === null) {
    return null;
  }

  const payload = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: props.listingTitle,
    url: props.canonicalListingUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(avg),
      reviewCount: props.reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}

type ListingReviewsPanelProps = {
  listingId: string;
  reviews: ListingReviewRow[];
  canSubmitReview: boolean;
  searchParamsHasSuccess?: boolean;
};

export function ListingReviewsPanel({
  listingId,
  reviews,
  canSubmitReview,
  searchParamsHasSuccess,
}: ListingReviewsPanelProps) {
  const avg = averageListingRating(reviews);

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Field reputation</h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400 md:text-sm">
            Reviews from buyers whose agreements progressed past drafting—signals trust without anonymous noise.
          </p>
        </div>
        {avg !== null ?
          <div className="rounded-xl border border-gold/35 bg-black/35 px-4 py-3 text-center backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Average</p>
            <p className="font-mono text-3xl font-bold text-white">{avg.toFixed(1)}</p>
            <p className="text-[11px] text-slate-400">{reviews.length} verified-trade review{reviews.length === 1 ? "" : "s"}</p>
          </div>
        : (
          <p className="text-sm text-slate-500">No reviews yet—the first mover sets the benchmark.</p>
        )}
      </div>

      {searchParamsHasSuccess ?
        <p className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          Review posted. Thanks for sharpening the marketplace.
        </p>
      : null}

      <ul className="mt-6 space-y-4">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-xl border border-white/10 bg-[#08142c]/80 p-4 backdrop-blur-md"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">{review.reviewer_display_name}</p>
                {review.reviewer_company ?
                  <p className="text-xs text-slate-400">{review.reviewer_company}</p>
                : null}
              </div>
              <div className="flex items-center gap-2">
                {review.is_verified_trade ?
                  <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                    Verified trade
                  </span>
                : null}
                <StarsRow rating={review.rating} />
              </div>
            </div>
            {review.headline ?
              <p className="mt-2 text-sm font-medium text-gold">{review.headline}</p>
            : null}
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{review.body}</p>
            <p className="mt-3 text-[11px] text-slate-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>

      {canSubmitReview ?
        <div className="mt-8 rounded-xl border border-dashed border-gold/35 bg-black/35 p-4 backdrop-blur">
          <h3 className="text-sm font-semibold text-white">Leave equipment feedback</h3>
          <p className="mt-1 text-xs text-slate-400">
            One review per listing. Keep it factual—future dispute tooling references this timeline.
          </p>
          <form action={submitListingReviewAction} className="mt-4 grid gap-3">
            <input type="hidden" name="listingId" value={listingId} />
            <label className="grid gap-1 text-xs text-slate-300 md:text-sm">
              Rating (1–5)
              <select
                name="rating"
                required
                className="rounded-lg border border-white/15 bg-[#08142c] px-3 py-2 text-white"
                defaultValue="5"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs text-slate-300 md:text-sm">
              Headline (optional)
              <input
                name="headline"
                maxLength={140}
                className="rounded-lg border border-white/15 bg-[#08142c] px-3 py-2 text-white"
                placeholder="e.g., Machine matched specs; payout discipline was elite."
              />
            </label>
            <label className="grid gap-1 text-xs text-slate-300 md:text-sm">
              Details *
              <textarea
                required
                name="body"
                minLength={12}
                rows={4}
                className="resize-y rounded-lg border border-white/15 bg-[#08142c] px-3 py-2 text-white"
                placeholder="Condition accuracy, responsiveness, lien clarity, mobilization—you know what separates pros."
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d] active:translate-y-[1px]"
            >
              Publish review
            </button>
          </form>
        </div>
      : null}
    </section>
  );
}
