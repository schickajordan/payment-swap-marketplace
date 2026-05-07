/** Central constants for UX, disclosures, and commercial surfaces (not enforcement). */

export const APP_NAME = "Payment Swap Marketplace";

/** Reserved production apex host — set `NEXT_PUBLIC_APP_URL=https://paymentswap.net` (or `https://www…`) when live. */
export const RESERVED_PUBLIC_DOMAIN = "paymentswap.net";

/** Hero eyebrow — lease-transfer / payment-swap positioning (heavy equipment). */
export const VISION_HEADLINE = "Heavy-equipment lease transfers & payment swaps";

/** Compact subtitle under wordmark (desktop nav). */
export const NAV_TAGLINE = "Assume payments · exit contracts · documented handoffs";

/** Homepage hero — disciplined equipment payment-transfer positioning. */
export const HOME_HERO_TITLE =
  "Take over or exit equipment payments with clear terms and verified counterparties.";

/** Above-the-fold promise: obligation / lessor / payoff clarity before anyone applies. */
export const HOME_HERO_LEAD =
  "Every listing shows monthly payment, remaining term, and transfer path up front. Buyers and sellers work in one thread with milestones, documents, and payment checkpoints kept together.";

/** About page lead; industry parallel without naming third-party brands. */
export const SHARE_ECONOMY_ANCHOR =
  "Equipment transfers need structure: clear payment terms, qualification checks, lender paperwork, and a clean audit trail. We built that workflow for contractor equipment, not consumer listings.";

/** First liquidity wedge — ship density here before broadening SKUs */
export const INITIAL_FOCUS_CATEGORIES = [
  "skid steers",
  "dump & equipment trailers",
  "mini excavators",
  "dump trucks",
] as const;

/** Payment-swap value props (homepage + pricing context). */
export const MOAT_PILLARS = [
  "Each listing declares its lane: assumption, private takeover, or lease-to-own",
  "Qualification and disclosures are captured early so lenders and insurers can review faster",
  "Messages, files, and milestones stay in one deal room",
  "Payout and optional escrow flows follow documented checkpoints",
] as const;

export const POSITIONING_LINES = [
  "We specialize in moving monthly obligation on contractor equipment: assumptions, private party takeovers, and lease-to-own exits—not casual weekend rentals.",
  `Inventory depth starts with ${INITIAL_FOCUS_CATEGORIES.slice(0, 3).join(", ")}, and ${INITIAL_FOCUS_CATEGORIES[3] ?? "dump trucks"}—categories where payment swaps actually clear.`,
  "Every serious transfer still runs through your attorneys, lienholders, and insurers; our job is to give them a clean, timestamped record instead of a scavenger hunt.",
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
  "Payment Swap Marketplace coordinates business-to-business equipment payment transfers—including lease assumptions, private payment takeovers, lease-to-own exits, and documented payment plans between users—not as lender, insurer, carrier, title agent, or equipment custodian unless expressly contracted elsewhere. Obligations owed to third-party financiers or lessors remain between those parties until an approved assumption or payoff path is satisfied. Verify insurance, liens, title, lienholder consent (where relevant), DOT & permit rules, jobsite logistics, and tax/title with qualified counsel.";

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
