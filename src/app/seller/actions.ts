"use server";

import { redirect } from "next/navigation";
import { addListingAssetUrls } from "@/lib/listings/assets";
import { type DealTemplate, parseDealTemplate } from "@/lib/listings/deal-template";
import { createListing } from "@/lib/listings/queries";
import { requireRole } from "@/lib/auth/authorization";

function legacyAgreementTypeFromDealTemplate(template: DealTemplate): string {
  switch (template) {
    case "assumption":
      return "lender-assumption";
    case "payment_swap_private":
      return "payment-swap";
    case "lease_to_own":
      return "lease-to-own";
    default: {
      const _e: never = template;
      return _e;
    }
  }
}

function parseCurrencyToCents(value: string): number {
  const normalized = value.replace(/[$,\s]/g, "");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid currency amount.");
  }
  return Math.round(amount * 100);
}

export async function createListingAction(formData: FormData) {
  const { user } = await requireRole(["seller", "admin"]);

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const serialOrVin = String(formData.get("serialOrVin") ?? "").trim();
  let dealTemplate;
  try {
    dealTemplate = parseDealTemplate(String(formData.get("dealTemplate") ?? ""));
  } catch {
    redirect("/seller?error=Choose a valid deal template.");
  }
  const collateralIsTitled = String(formData.get("collateralIsTitled") ?? "") === "yes";

  if (!title || !description || !category || !serialOrVin) {
    redirect("/seller?error=Missing required listing fields.");
  }

  try {
    const listing = await createListing({
      title,
      description,
      category,
      serial_or_vin: serialOrVin,
      deal_template: dealTemplate,
      collateral_is_titled: collateralIsTitled,
      make: String(formData.get("make") ?? "").trim() || null,
      model: String(formData.get("model") ?? "").trim() || null,
      model_year: Number(formData.get("modelYear")) || null,
      location_city: String(formData.get("locationCity") ?? "").trim() || null,
      location_state: String(formData.get("locationState") ?? "").trim() || null,
      monthly_payment_cents: parseCurrencyToCents(
        String(formData.get("monthlyPayment") ?? "0")
      ),
      deposit_cents: parseCurrencyToCents(String(formData.get("deposit") ?? "0")),
      buyout_price_cents: String(formData.get("buyoutPrice") ?? "").trim()
        ? parseCurrencyToCents(String(formData.get("buyoutPrice")))
        : null,
      remaining_term_months: Number(formData.get("remainingTermMonths")) || null,
      condition_rating: String(formData.get("conditionRating") ?? "").trim() || null,
      status: "pending_review",
      metadata: {
        agreement_type: legacyAgreementTypeFromDealTemplate(dealTemplate),
      },
    });

    const assetUrls = String(formData.get("assetUrls") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    await addListingAssetUrls(listing.id, user.id, assetUrls);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing.";
    redirect(`/seller?error=${encodeURIComponent(message)}`);
  }

  redirect("/seller?success=listing-created");
}
