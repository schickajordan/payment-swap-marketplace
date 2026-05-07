import type { Database } from "@/lib/supabase/database.types";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

const DEMO_SELLER_ID = "00000000-0000-4000-8000-00000000d001";
const created = "2026-01-15T12:00:00.000Z";

/** Frozen samples so the product tour matches real marketplace card layout. */
export const DEMO_MARKETPLACE_LISTINGS: ListingRow[] = [
  {
    id: "00000000-0000-4000-8000-00000000e101",
    seller_id: DEMO_SELLER_ID,
    title: "2021 Caterpillar 336 — lease-to-own takeback",
    description:
      "Demo-only copy: one previous retail lessee, inspection reports on file, titled collateral. Use this card to show how monthly + lane badges read on the catalog.",
    category: "Excavator",
    make: "Caterpillar",
    model: "336",
    model_year: 2021,
    serial_or_vin: "DEMO-SERIAL-336-TX",
    location_city: "Houston",
    location_state: "TX",
    monthly_payment_cents: 425_000,
    deposit_cents: 150_000,
    buyout_price_cents: 28_500_000,
    remaining_term_months: 18,
    condition_rating: "good",
    deal_template: "lease_to_own",
    collateral_is_titled: true,
    status: "active",
    metadata: {},
    created_at: created,
    updated_at: created,
  },
  {
    id: "00000000-0000-4000-8000-00000000e102",
    seller_id: DEMO_SELLER_ID,
    title: "Freightliner M2 106 box truck — private payment swap",
    description:
      "Demo-only copy: illustrates payment-swap lane and a deposit line on the card. Not a live listing.",
    category: "Box truck",
    make: "Freightliner",
    model: "M2 106",
    model_year: 2019,
    serial_or_vin: "DEMO-VIN-FL-OH",
    location_city: "Columbus",
    location_state: "OH",
    monthly_payment_cents: 289_000,
    deposit_cents: 8_500_00,
    buyout_price_cents: null,
    remaining_term_months: 24,
    condition_rating: "excellent",
    deal_template: "payment_swap_private",
    collateral_is_titled: true,
    status: "active",
    metadata: {},
    created_at: created,
    updated_at: created,
  },
  {
    id: "00000000-0000-4000-8000-00000000e103",
    seller_id: DEMO_SELLER_ID,
    title: "53' dry van — lender assumption lane",
    description:
      "Demo-only copy: long-haul trailer packaged as an assumption-style swap. Shows how term + condition read when imagery is still pending.",
    category: "Trailer",
    make: "Great Dane",
    model: "Champion SE",
    model_year: 2018,
    serial_or_vin: "DEMO-VIN-GD-GA",
    location_city: "Savannah",
    location_state: "GA",
    monthly_payment_cents: 512_500,
    deposit_cents: 0,
    buyout_price_cents: 4_200_000,
    remaining_term_months: 12,
    condition_rating: "fair",
    deal_template: "assumption",
    collateral_is_titled: true,
    status: "active",
    metadata: {},
    created_at: created,
    updated_at: created,
  },
];

/** Plain-English checklist that mirrors the seller dashboard form. */
export const DEMO_SELLER_FIELD_GUIDE: { field: string; tip: string }[] = [
  { field: "Listing title", tip: "Lead with equipment + why it’s attractive (year, model, lane)." },
  { field: "Category", tip: "What a buyer would search (excavator, boom truck, reefer, etc.)." },
  { field: "Make / model / year", tip: "Match your spec sheet—buyers filter mentally on this line." },
  { field: "Serial / VIN", tip: "Required for ops; proves the unit you are describing." },
  { field: "City & state", tip: "Where the asset is today (or where title sits)." },
  { field: "Monthly payment", tip: "The headline buyers compare—your contracted all-in monthly." },
  { field: "Deposit & buyout", tip: "Anything due up front and an optional purchase option price." },
  { field: "Remaining term", tip: "How many payments or months remain on the obligation you’re swapping." },
  { field: "Condition", tip: "Honest grade so you book serious buyers, not surprises." },
  { field: "Deal template / lane", tip: "Matches the paperwork path (assumption, payment swap, lease-to-own)." },
  { field: "Titled collateral", tip: "Check this when DOT/title applies; it drives compliance checks." },
  { field: "Description", tip: "Inspection highlights, liens, service history—mirror what you’d say on a call." },
];
