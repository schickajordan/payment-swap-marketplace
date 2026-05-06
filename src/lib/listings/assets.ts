import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type ListingAssetInsert = Database["public"]["Tables"]["listing_assets"]["Insert"];
type ListingAssetRow = Database["public"]["Tables"]["listing_assets"]["Row"];

export async function addListingAssetUrls(
  listingId: string,
  ownerId: string,
  urls: string[]
) {
  const normalized = urls
    .map((url) => url.trim())
    .filter(Boolean)
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 20);

  if (normalized.length === 0) {
    return;
  }

  const rows: ListingAssetInsert[] = normalized.map((url, index) => ({
    listing_id: listingId,
    owner_id: ownerId,
    asset_type: /\.(mov|mp4|m4v|webm)$/i.test(url) ? "video" : "image",
    storage_path: url,
    public_url: url,
    sort_order: index,
  }));

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("listing_assets").insert(rows);

  if (error) {
    throw new Error(`Failed to save listing assets: ${error.message}`);
  }
}

export async function getListingAssetsMapByListingIds(
  listingIds: string[]
): Promise<Map<string, ListingAssetRow[]>> {
  const map = new Map<string, ListingAssetRow[]>();
  if (listingIds.length === 0) {
    return map;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("listing_assets")
    .select("*")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch listing assets: ${error.message}`);
  }

  for (const row of data ?? []) {
    const existing = map.get(row.listing_id) ?? [];
    existing.push(row);
    map.set(row.listing_id, existing);
  }

  return map;
}
