import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/marketplace";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  title: `Browse inventory · ${APP_NAME}`,
  description:
    "Search heavy equipment with monthly headline pricing—filter by swap lane (lender assumption, private payment takeover, lease-to-own), state, and category. Installments and escrow when enabled.",
  alternates: {
    canonical: `${getCanonicalSiteUrl()}/marketplace`,
  },
};
