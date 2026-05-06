/** Shareable `/marketplace` query strings — keep filters in sync across nav, PDP, sidebar. */

import { parseMarketplaceDealFilter } from "@/lib/listings/deal-template";

export type MarketplaceHrefParams = {
  q?: string;
  state?: string;
  category?: string;
  deal?: string;
  sort?: string;
};

export function marketplaceQueryString(params: MarketplaceHrefParams): string {
  const p = new URLSearchParams();
  const q = params.q?.trim();
  const state = params.state?.trim().toUpperCase().slice(0, 2);
  const category = params.category?.trim();
  const sort = params.sort?.trim();
  const deal = parseMarketplaceDealFilter(params.deal);

  if (q) p.set("q", q);
  if (state && state.length === 2) p.set("state", state);
  if (category) p.set("category", category);
  if (deal) p.set("deal", deal);
  if (sort && sort !== "newest") p.set("sort", sort);

  const s = p.toString();
  return s === "" ? "" : `?${s}`;
}
