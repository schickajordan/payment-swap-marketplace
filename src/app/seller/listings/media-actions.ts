"use server";

import { requireRole } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PUBLIC_BUCKET = "listing-media";

export type RegisterMediaResult = { ok: true } | { ok: false; message: string };

export async function registerListingMediaAsset(formData: FormData): Promise<RegisterMediaResult> {
  const session = await requireRole(["seller", "admin"]);

  const listingId = String(formData.get("listingId") ?? "").trim();
  const storagePath = String(formData.get("storagePath") ?? "").trim();
  const mime = String(formData.get("mime") ?? "");

  const assetType =
    mime.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(storagePath)
      ? ("video" as const)
      : ("image" as const);

  if (!listingId || !storagePath) {
    return { ok: false, message: "Missing upload metadata." };
  }

  if (!/^[\w./-]+$/.test(storagePath) || storagePath.includes("..")) {
    return { ok: false, message: "Invalid storage path." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return { ok: false, message: "Listing not found." };
  }

  const isSellerOwner = listing.seller_id === session.user.id;

  if (session.role !== "admin" && !isSellerOwner) {
    return { ok: false, message: "Not authorized for this listing." };
  }

  if (!storagePath.startsWith(`${listingId}/`)) {
    return { ok: false, message: "Path must start with listing id." };
  }

  const { data: signed } = supabase.storage.from(PUBLIC_BUCKET).getPublicUrl(storagePath);
  const publicUrl = signed.publicUrl;

  const { data: rows } = await supabase
    .from("listing_assets")
    .select("sort_order")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder =
    typeof rows?.[0]?.sort_order === "number" ? rows![0].sort_order + 1 : 0;

  const { error } = await supabase.from("listing_assets").insert({
    listing_id: listingId,
    owner_id: listing.seller_id,
    asset_type: assetType,
    storage_path: storagePath,
    public_url: publicUrl,
    sort_order: sortOrder,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
