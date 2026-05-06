import Link from "next/link";
import { approveListingAction, rejectListingAction } from "@/app/admin/listing-actions";
import { dealTemplateLabel } from "@/lib/listings/deal-template";
import { getPendingListingsForReview } from "@/lib/listings/queries";

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })}`;
}

type PendingListingsSectionProps = {
  listingSearch?: string;
};

function formatSubmitted(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function PendingListingsSection({ listingSearch }: PendingListingsSectionProps) {
  const pending = await getPendingListingsForReview({
    q: listingSearch?.trim() ? listingSearch : undefined,
  });

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Listing verification queue</h2>
        <form method="get" className="flex flex-wrap items-center gap-2">
          <label htmlFor="listingSearch" className="sr-only">
            Filter listings
          </label>
          <input
            id="listingSearch"
            name="listingSearch"
            defaultValue={listingSearch ?? ""}
            placeholder="Title, make, model, VIN…"
            className="min-w-[200px] rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold md:min-w-[260px]"
          />
          <button
            type="submit"
            className="rounded-md border border-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Filter
          </button>
          {listingSearch ?
            <Link
              href="/admin"
              className="rounded-md px-2 py-2 text-sm font-semibold text-gold hover:text-[#ffd14d]"
            >
              Clear
            </Link>
          : null}
        </form>
      </div>
      {pending.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
          {listingSearch ? "No listings match that filter." : "No listings awaiting review."}
        </p>
      ) : (
        pending.map((listing) => (
          <article key={listing.id} className="rounded-xl border border-white/10 bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                <p className="text-sm text-slate-300">
                  {listing.category} · Seller {listing.seller_id.slice(0, 8)}… · Submitted{" "}
                  {formatSubmitted(listing.created_at)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-400">{dealTemplateLabel(listing.deal_template)}</span>
                  {listing.collateral_is_titled ? " · titled / VIN" : " · serial / UCC"}
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">ID {listing.id}</p>
              </div>
              <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase text-gold">
                {listing.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm text-slate-400">{listing.description}</p>
            <p className="mt-2 text-sm text-slate-300">
              Monthly {centsToUsd(listing.monthly_payment_cents)} ·{" "}
              {listing.location_city ?? "—"}, {listing.location_state ?? "—"}
            </p>
            <div className="mt-3">
              <Link
                href={`/listings/${listing.id}`}
                className="text-sm font-semibold text-gold hover:text-[#ffd14d]"
              >
                Open full preview →
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={approveListingAction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button
                  type="submit"
                  className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                >
                  Publish listing
                </button>
              </form>
              <form action={rejectListingAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="listingId" value={listing.id} />
                <textarea
                  name="reason"
                  required
                  rows={2}
                  placeholder="Reason (internal + seller-visible via status)"
                  className="min-w-[200px] rounded-md border border-white/20 bg-[#091c3d] px-2 py-1.5 text-sm text-white outline-none focus:border-gold md:min-w-[280px]"
                />
                <button
                  type="submit"
                  className="rounded-md border border-red-300/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                >
                  Flag / reject
                </button>
              </form>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
