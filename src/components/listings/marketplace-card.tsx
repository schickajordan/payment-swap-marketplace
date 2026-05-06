import Image from "next/image";
import Link from "next/link";
import { ListingTrustSignals } from "@/components/trust/listing-trust-signals";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { Database } from "@/lib/supabase/database.types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

type MarketplaceCardProps = {
  listing: Listing;
  thumbnailUrl?: string;
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })}`;
}

function conditionBadge(rating: string | null): string | null {
  if (!rating?.trim()) {
    return null;
  }
  return rating.trim().slice(0, 32);
}

function dealTemplateShort(listing: Listing): string {
  return (
    MARKETPLACE_DEAL_LANE_ENTRIES.find((e) => e.deal === listing.deal_template)?.cardBadgeLabel ?? "Deal"
  );
}

export function MarketplaceCard({ listing, thumbnailUrl }: MarketplaceCardProps) {
  const conditionLabel = conditionBadge(listing.condition_rating);
  const laneBadge = dealTemplateShort(listing);
  const monthlyLabel = centsToUsd(listing.monthly_payment_cents);
  const locality = [listing.location_city, listing.location_state].filter(Boolean).join(", ") || "Location TBD";

  return (
    <article
      aria-label={`${listing.title}: ${laneBadge}, ${monthlyLabel} per month, ${locality}`}
      className="group flex touch-manipulation flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-card to-[#0a1733] px-4 pb-4 pt-3 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.65)] transition duration-300 hover:border-gold/45 hover:shadow-[0_28px_90px_-35px_rgba(242,183,5,0.18)] sm:px-5 sm:pb-5 sm:pt-4"
    >
      {thumbnailUrl ? (
        <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/10">
          <Image
            src={thumbnailUrl}
            alt={listing.title}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1280px) 33vw, 320px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            quality={76}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-3 flex flex-wrap items-center justify-between gap-1 px-3 text-[10px] font-semibold uppercase tracking-wide">
            <span className="rounded bg-black/60 px-2 py-0.5 text-gold">{listing.category}</span>
            <span className="rounded bg-black/60 px-2 py-0.5 text-emerald-200/95">{laneBadge}</span>
            {listing.location_state ? (
              <span className="rounded bg-black/60 px-2 py-0.5 text-white">{listing.location_state}</span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mb-4 flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl bg-[#08142c] ring-1 ring-white/10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Awaiting imagery</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90">{laneBadge}</span>
          <span className="mt-1 text-xs text-muted">{listing.location_state ?? "—"}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold md:text-xs">Monthly headline</p>
          <p className="font-mono text-2xl font-bold tracking-tight text-white md:text-3xl">
            {monthlyLabel}
            <span className="ml-1 text-sm font-semibold uppercase text-slate-400">/mo</span>
          </p>
          {listing.deposit_cents > 0 ? (
            <p className="text-xs text-slate-500">Deposit {centsToUsd(listing.deposit_cents)}</p>
          ) : null}
        </div>

        <ListingTrustSignals listing={listing} dense />

        <Link href={`/listings/${listing.id}`} className="text-lg font-semibold leading-snug text-white hover:text-gold">
          {listing.title}
        </Link>
        <p className="text-sm text-slate-400">
          {listing.make ? `${listing.make}` : ""}
          {listing.model ? ` ${listing.model}` : ""}{" "}
          {listing.model_year ? `· ${listing.model_year}` : ""}{" "}
          {conditionLabel ? (
            <>
              · <span className="text-slate-300">Condition:</span> {conditionLabel}
            </>
          ) : null}
        </p>
        <div className="mt-auto pt-4 text-sm text-slate-300">
          <p className="font-medium text-white">
            {listing.location_city ?? "Location TBD"},{" "}
            <span className="text-muted">{listing.location_state ?? "—"}</span>
          </p>
          {listing.remaining_term_months ? (
            <p className="text-slate-500">~{listing.remaining_term_months} mo runway</p>
          ) : (
            <p className="text-xs text-slate-500">Term negotiable · confirm in thread</p>
          )}
        </div>
      </div>
      <Link
        href={`/listings/${listing.id}`}
        className="mt-4 block rounded-xl border border-gold/30 bg-black/35 py-2.5 text-center text-sm font-semibold tracking-wide text-white backdrop-blur hover:border-gold/60 hover:bg-gold/10 active:translate-y-[1px] sm:hidden"
      >
        View details
      </Link>
      <Link
        href={`/listings/${listing.id}`}
        className="mt-4 hidden rounded-xl border border-white/14 bg-white/5 px-3 py-2.5 text-center text-sm font-medium text-slate-100 hover:border-gold/40 hover:bg-white/10 active:translate-y-[1px] sm:block"
      >
        View listing
      </Link>
    </article>
  );
}
