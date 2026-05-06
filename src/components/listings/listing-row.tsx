import Link from "next/link";
import { dealTemplateLabel } from "@/lib/listings/deal-template";
import { Database } from "@/lib/supabase/database.types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

type ListingRowProps = {
  listing: Listing;
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function ListingRow({ listing }: ListingRowProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
          <p className="text-sm text-slate-300">
            {listing.category} {listing.make ? `- ${listing.make}` : ""}{" "}
            {listing.model ?? ""}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {dealTemplateLabel(listing.deal_template)}
            {listing.collateral_is_titled ? " · titled / VIN path" : " · serial / UCC path"}
          </p>
        </div>
        <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase tracking-wide text-gold">
          {listing.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
        <p>Monthly: {centsToUsd(listing.monthly_payment_cents)}</p>
        <p>Deposit: {centsToUsd(listing.deposit_cents)}</p>
        <p>
          Location: {listing.location_city ?? "N/A"}, {listing.location_state ?? "N/A"}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/seller/listings/${listing.id}/media`}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-white/10"
        >
          Upload media
        </Link>
      </div>
    </article>
  );
}
