import { parseMarketplaceDealFilter } from "@/lib/listings/deal-template";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
type CreateListingInput = Database["public"]["Tables"]["listings"]["Insert"];

export function sanitizeListingSearch(term: string) {
  return term.replace(/[%_\\]/g, "").slice(0, 80).trim();
}

export type MarketplaceSort = "newest" | "price_low" | "price_high";

export async function getMarketplaceListings(options: {
  q?: string;
  state?: string;
  category?: string;
  deal?: string;
  sort?: MarketplaceSort;
  limit?: number;
}): Promise<ListingRow[]> {
  const supabase = await createServerSupabaseClient();
  const limit = Math.min(options.limit ?? 48, 100);
  let query = supabase.from("listings").select("*").eq("status", "active").limit(limit);

  const deal = options.deal ? parseMarketplaceDealFilter(sanitizeListingSearch(options.deal).toLowerCase()) : undefined;
  if (deal) {
    query = query.eq("deal_template", deal);
  }

  const q = options.q ? sanitizeListingSearch(options.q) : "";
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,category.ilike.%${q}%,description.ilike.%${q}%,make.ilike.%${q}%,model.ilike.%${q}%,location_city.ilike.%${q}%`
    );
  }

  const stateRaw = options.state ? sanitizeListingSearch(options.state).toUpperCase().slice(0, 2) : "";
  if (stateRaw.length === 2) {
    query = query.eq("location_state", stateRaw);
  }

  const cat = options.category ? sanitizeListingSearch(options.category).slice(0, 80) : "";
  if (cat) {
    query = query.ilike("category", `%${cat}%`);
  }

  const sort = options.sort ?? "newest";
  if (sort === "price_low") {
    query = query
      .order("monthly_payment_cents", { ascending: true })
      .order("created_at", { ascending: false });
  } else if (sort === "price_high") {
    query = query
      .order("monthly_payment_cents", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch marketplace listings: ${error.message}`);
  }

  return data ?? [];
}

export async function getActiveListingById(id: string): Promise<ListingRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load listing: ${error.message}`);
  }

  return data;
}

/**
 * PDP loader: RLS returns active listings to everyone; sellers see their drafts; admins see all statuses.
 */
export async function getListingForDetailPage(id: string): Promise<ListingRow | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load listing: ${error.message}`);
  }

  return data;
}

export async function getPendingListingsForReview(options?: { q?: string }): Promise<ListingRow[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("listings")
    .select("*")
    .in("status", ["pending_review", "draft"])
    .order("created_at", { ascending: false });

  const q = options?.q ? sanitizeListingSearch(options.q) : "";
  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,make.ilike.%${q}%,model.ilike.%${q}%,category.ilike.%${q}%,serial_or_vin.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch pending listings: ${error.message}`);
  }

  return data ?? [];
}

export async function getActiveListings(limit = 20): Promise<ListingRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch active listings: ${error.message}`);
  }

  return data ?? [];
}

const SITEMAP_LISTING_BATCH = 1000;
const SITEMAP_LISTING_MAX = 50_000;

/** Active listing id + updated_at for sitemap; uses anon/server client (RLS: active only). */
export async function getActiveListingSitemapEntries(options?: {
  maxRows?: number;
}): Promise<Pick<ListingRow, "id" | "updated_at">[]> {
  const cap = Math.min(options?.maxRows ?? SITEMAP_LISTING_MAX, SITEMAP_LISTING_MAX);
  const supabase = await createServerSupabaseClient();
  const out: Pick<ListingRow, "id" | "updated_at">[] = [];

  for (let offset = 0; offset < cap; offset += SITEMAP_LISTING_BATCH) {
    const take = Math.min(SITEMAP_LISTING_BATCH, cap - offset);
    const end = offset + take - 1;
    const { data, error } = await supabase
      .from("listings")
      .select("id, updated_at")
      .eq("status", "active")
      .order("updated_at", { ascending: false })
      .range(offset, end);

    if (error) {
      throw new Error(`Failed to fetch sitemap listings: ${error.message}`);
    }
    if (!data?.length) break;
    out.push(...data);
    if (data.length < take) break;
  }

  return out;
}

export async function getMyListings(): Promise<ListingRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch seller listings: ${error.message}`);
  }

  return data ?? [];
}

export async function createListing(
  input: Omit<CreateListingInput, "seller_id">
): Promise<ListingRow> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create a listing.");
  }

  const payload: CreateListingInput = {
    ...input,
    seller_id: user.id,
  };

  const { data, error } = await supabase
    .from("listings")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create listing: ${error.message}`);
  }

  return data;
}
