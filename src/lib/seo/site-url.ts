export function getCanonicalSiteUrl(): string {
  const u = process.env.NEXT_PUBLIC_APP_URL;
  if (typeof u === "string" && u.startsWith("http")) {
    return u.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/** Open Graph / Twitter bots require absolute `https?://` URLs. */
export function toAbsoluteOgImageUrl(siteBase: string, candidate: string | null | undefined): string | null {
  const trimmed = typeof candidate === "string" ? candidate.trim() : "";
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const base = siteBase.replace(/\/$/, "");

  const supabaseOrigin = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")
    : null;

  const pathOnly = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (supabaseOrigin && pathOnly.startsWith("/storage/")) {
    return `${supabaseOrigin}${pathOnly}`;
  }

  return `${base}${pathOnly}`;
}

const LISTING_MEDIA_BUCKET = "listing-media";

/** First resolved absolute URL for a listing_media row (`public_url` or Supabase Storage). */
export function listingImageOgUrl(
  siteBase: string,
  asset: { asset_type: string; public_url: string | null; storage_path: string }
): string | null {
  if (asset.asset_type !== "image") {
    return null;
  }

  const fromStored = toAbsoluteOgImageUrl(siteBase, asset.public_url);
  if (fromStored) {
    return fromStored;
  }

  const path = asset.storage_path.trim();
  if (!path) return null;

  const supabaseOrigin = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")
    : null;
  if (!supabaseOrigin) return null;

  const encoded = path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseOrigin}/storage/v1/object/public/${LISTING_MEDIA_BUCKET}/${encoded}`;
}
