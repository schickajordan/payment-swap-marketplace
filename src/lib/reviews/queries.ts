import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type ListingReviewRow = Database["public"]["Tables"]["listing_reviews"]["Row"];

export async function getListingReviewsForPublicListing(listingId: string): Promise<ListingReviewRow[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("listing_reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`listing_reviews: ${error.message}`);
  }

  return data ?? [];
}

export function averageListingRating(reviews: ListingReviewRow[]): number | null {
  if (!reviews.length) {
    return null;
  }
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export async function buyerCanSubmitListingReview(
  listingId: string,
  buyerId: string
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  const { count, error } = await supabase
    .from("listing_reviews")
    .select("*", { count: "exact", head: true })
    .eq("listing_id", listingId)
    .eq("reviewer_id", buyerId);

  if (error) {
    throw new Error(`listing_reviews eligibility: ${error.message}`);
  }
  if (count && count > 0) {
    return false;
  }

  const { data: listing, error: lErr } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (lErr || !listing || listing.status !== "active" || listing.seller_id === buyerId) {
    return false;
  }

  const { data: agreement, error: aErr } = await supabase
    .from("payment_agreements")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .in("status", ["signed", "active", "completed"])
    .maybeSingle();

  if (aErr || !agreement) {
    return false;
  }

  return true;
}
