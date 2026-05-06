import { dealTemplateLabel } from "@/lib/listings/deal-template";
import { Database } from "@/lib/supabase/database.types";
import { TrustChip } from "@/components/ui/trust-chip";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

type ListingTrustSignalsProps = {
  listing: Listing;
  /** When surfaced on authenticated seller context you may pass booleans later */
  dense?: boolean;
};

/**
 * Confidence surface for marketplace cards + PDP. Copy tracks actual capabilities wired in product.
 */
export function ListingTrustSignals({ listing, dense }: ListingTrustSignalsProps) {
  const activeListing = listing.status === "active";

  return (
    <ul
      className={`flex flex-wrap gap-2 ${dense ? "" : "mt-3"}`}
      aria-label="Trust and compliance signals"
    >
      {activeListing ? (
        <TrustChip tone="gold" title="Publication reviewed by marketplace operations">
          Ops-cleared inventory
        </TrustChip>
      ) : (
        <TrustChip tone="muted">Non-active listing · limited visibility</TrustChip>
      )}
      <TrustChip tone="steel" title="Agreements support escrow toggle + Stripe Connect routing when enabled">
        Escrow-ready · Connect payouts
      </TrustChip>
      <TrustChip tone="steel" title="Messaging and admin audit timelines on funded deals">
        Threaded audits
      </TrustChip>
      <TrustChip tone="steel" title="Seller-selected swap lane for this listing">
        {dealTemplateLabel(listing.deal_template)}
      </TrustChip>
      {listing.collateral_is_titled ? (
        <TrustChip tone="muted" title="Use VIN + title verification workflow">
          Titled collateral
        </TrustChip>
      ) : (
        <TrustChip tone="muted" title="Use serial + ownership / lien documentation path">
          Non-titled collateral
        </TrustChip>
      )}
    </ul>
  );
}
