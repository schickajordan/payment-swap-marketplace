import type { MetadataRoute } from "next";
import { getActiveListingSitemapEntries } from "@/lib/listings/queries";
import { authRoutes } from "@/lib/navigation";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

/** Refresh listing URLs periodically without a full redeploy (static shell + dynamic data). */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getCanonicalSiteUrl();
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.88 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${base}${authRoutes.signIn}`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}${authRoutes.signUp}`, lastModified: now, changeFrequency: "monthly", priority: 0.35 },
  ];

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await getActiveListingSitemapEntries();
    listingRoutes = rows.map((row) => ({
      url: `${base}/listings/${row.id}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    listingRoutes = [];
  }

  return [...routes, ...listingRoutes];
}
