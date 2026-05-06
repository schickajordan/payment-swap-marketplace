/** Central constants for UX, disclosures, and commercial surfaces (not enforcement). */

export const APP_NAME = "Payment Swap Marketplace";

/** Reserved production apex host — set `NEXT_PUBLIC_APP_URL=https://paymentswap.net` (or `https://www…`) when live. */
export const RESERVED_PUBLIC_DOMAIN = "paymentswap.net";

/** Short line for marketing surfaces (homepage hero, SEO-friendly). */
export const VISION_HEADLINE = "Heavy equipment marketplace for real contractors";

/**
 * Elevator riff: passenger peer-rentals as a metaphor only.
 * “Turo” is a registered trademark of Turo Inc.—we’re independent and not endorsed by them.
 */
export const SHARE_ECONOMY_ANCHOR =
  "Turo made peer car swaps feel turnkey on your phone—we’re swinging for that same unmistakable fullness, except contractor turf: skid steers, dumps, fleets, installments, escrow when enabled, lien threads, inspectors, invoicing—all the heavyweight workflow cars never demanded, between verified businesses only.";

/** First liquidity wedge — ship density here before broadening SKUs */
export const INITIAL_FOCUS_CATEGORIES = [
  "skid steers",
  "dump & equipment trailers",
  "mini excavators",
  "dump trucks",
] as const;

/** Why the product exists — plain English for shoppers and sellers. */
export const MOAT_PILLARS = [
  "Verified business accounts—you’re dealing with companies, not random handles",
  "Messages and milestones for each deal, so terms don’t disappear in a text chain",
  "Optional escrow-style payouts to sellers when those tools are enabled",
  "Inspections & reviews—with room to add logistics partners over time",
] as const;

export const POSITIONING_LINES = [
  "We connect businesses that rent, lease-to-own, or restructure payments on skid steers, trailers, excavators, dump trucks—and the other iron that keeps crews working.",
  `Right now we’re focused deeply on categories like ${INITIAL_FOCUS_CATEGORIES.slice(0, 3).join(", ")}, and ${INITIAL_FOCUS_CATEGORIES[3] ?? "dump trucks"}, so search results stay useful—not a mile wide and empty.`,
  "The product isn’t just photos and a listing: it’s clear terms, tracked conversations, checkpoints for liens & insurance questions, optional escrow help, and a record everyone can revisit if something goes sideways.",
] as const;

/** Extra reassurance line on the homepage (internal discipline, customer-friendly wording). */
export const LIQUIDITY_WEDGE_LINE =
  "We grow one metro and a handful of equipment types at a time—so the catalog feels full, not ghost-town empty.";

export const MOAT_WEDGE_LINE =
  "Documented timelines and secure payouts matter more than a slick grid: verification, installments, escrow help, and support when disputes show up.";

/** How we prioritize growth — written for ordinary readers, not investors. */
export const NORTH_STAR_LIQUIDITY = {
  label: "Deals that finish—not just clicks",
  definition:
    "We care when buyers and sellers actually move money and hit milestones on the platform, especially in the same region and categories where we operate.",
  why: "A marketplace only works when people come back because deals close.",
} as const;

/** Companion story: trust layered into payouts and documentation. */
export const NORTH_STAR_MOAT = {
  label: "Trust you can trace",
  definition:
    "More activity should flow through verified accounts, in-app messaging, optional escrow collections, and straightforward seller payouts—instead of disappearing into personal texts.",
  why: "When people trust the rails, listings turn into repeat business.",
} as const;

/** Marketing-safe wording — platform does not originate or assume third-party secured debt. */
export const LEGAL_SURFACE_DISCLAIMER =
  "Payment Swap Marketplace facilitates business-to-business equipment transactions—including coordination of leases, rentals, lease-to-own, and private payment agreements between users—not as lender, insurer, carrier, title agent, or equipment custodian unless expressly contracted elsewhere. Financing or loan obligations documented with third parties remain solely between borrower and lender unless an approved assumption exists. Rentals and payment swaps remain between counterparties subject to contracts and applicable law. Verify insurance, liens, title, lienholder consent (where relevant), DOT & permit rules, jobsite logistics, and tax/title with qualified counsel.";

export const FEE_STRUCTURE = [
  { name: "Standard listing", detail: "$99 publishing fee (pricing subject to tier)" },
  { name: "Premium placement", detail: "$199 listing upgrade" },
  { name: "Dealer unlimited", detail: "$599/month for high-volume fleets" },
  {
    name: "Swap activation",
    detail: "$499–$2,500 scaled to equipment tier at agreement execution",
  },
  { name: "Active swap service", detail: "$49–$149/month optional platform services" },
  { name: "Escrow facilitation", detail: "2%–5% per monthly collection when escrow active" },
  { name: "Contract packages", detail: "$199–$999 legal workflow add-ons (attorney review recommended)" },
  { name: "Inspections & premium ads", detail: "$250–$850 inspections; ads from $49/week" },
] as const;
