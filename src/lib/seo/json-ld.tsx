import { APP_NAME } from "@/lib/config/marketplace";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export function OrganizationJsonLd() {
  const url = getCanonicalSiteUrl();

  const payload = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url,
    description:
      "Business marketplace for heavy equipment rentals, leases, payment plans, and optional escrow—with verified counterparties.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export function WebSiteSearchJsonLd() {
  const url = getCanonicalSiteUrl();

  const payload = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/marketplace?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
