import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/buyer", "/seller"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
