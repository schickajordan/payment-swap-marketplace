import { DEAL_TEMPLATES, dealTemplateLabel, type DealTemplate } from "@/lib/listings/deal-template";
import { marketplaceQueryString } from "@/lib/marketplace/url";

export function marketplaceHrefForDealLane(deal: DealTemplate): string {
  return `/marketplace${marketplaceQueryString({ deal })}`;
}

const COMPACT_LABEL: Record<DealTemplate, string> = {
  assumption: "Assumption",
  payment_swap_private: "Payment takeover",
  lease_to_own: "Lease-to-own",
};

/** Shorter chips for dense homepage strips. */
const PILL_LABEL: Record<DealTemplate, string> = {
  assumption: "Assumption",
  payment_swap_private: "Takeover",
  lease_to_own: "Lease-to-own",
};

/** Copy for the `/marketplace` left-rail lane filter (keeps URL params from `href()` helper). */
const SIDEBAR_LABEL: Record<DealTemplate, string> = {
  assumption: "Lender assumption",
  payment_swap_private: "Payment swap",
  lease_to_own: "Lease-to-own",
};

/** Short badge on listing cards (matches sidebar wording where it fits). */
const CARD_BADGE_LABEL: Record<DealTemplate, string> = {
  assumption: "Assumption",
  payment_swap_private: "Payment swap",
  lease_to_own: "Lease-to-own",
};

/** Human label for saved-search toolbar when `deal` query param is set. */
const SAVED_SEARCH_LABEL: Record<DealTemplate, string> = {
  assumption: "Assumption lane",
  payment_swap_private: "Payment swap lane",
  lease_to_own: "Lease-to-own lane",
};

/** Single source of truth for preset swap-lane navigation across marketing + footer + filters. */
export const MARKETPLACE_DEAL_LANE_ENTRIES = DEAL_TEMPLATES.map((deal) => ({
  deal,
  href: marketplaceHrefForDealLane(deal),
  compactLabel: COMPACT_LABEL[deal],
  pillLabel: PILL_LABEL[deal],
  longLabel: dealTemplateLabel(deal),
  sidebarLabel: SIDEBAR_LABEL[deal],
  cardBadgeLabel: CARD_BADGE_LABEL[deal],
  savedSearchLabel: SAVED_SEARCH_LABEL[deal],
}));

/** Resolve bookmark label for persisted marketplace URLs (`deal` query). */
export function savedSearchLabelForDealParam(deal: string | null | undefined): string | null {
  const key = deal?.trim().toLowerCase();
  const entry = MARKETPLACE_DEAL_LANE_ENTRIES.find((e) => e.deal === key);
  return entry?.savedSearchLabel ?? null;
}
