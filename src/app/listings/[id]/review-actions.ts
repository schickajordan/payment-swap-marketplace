"use server";

import { redirect } from "next/navigation";
import { buyerCanSubmitListingReview } from "@/lib/reviews/queries";
import { requireRole } from "@/lib/auth/authorization";
import { authRoutes } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function clampRating(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return null;
  }
  return n;
}

export async function submitListingReviewAction(formData: FormData) {
  await requireRole(["buyer", "seller", "admin"]);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authRoutes.signIn);
  }

  const listingId = String(formData.get("listingId") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim().slice(0, 140);
  const body = String(formData.get("body") ?? "").trim().slice(0, 4000);
  const rating = clampRating(formData.get("rating"));

  if (!listingId || !rating || body.length < 12) {
    redirect(`/listings/${listingId || "unknown"}?error=Review requires rating and at least ~12 characters.`);
  }

  const eligible = await buyerCanSubmitListingReview(listingId, user.id);
  if (!eligible) {
    redirect(
      `/listings/${listingId}?error=${encodeURIComponent("Reviews unlock after ops advances your agreement—and only once per listing.")}`
    );
  }

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("full_name, company_name")
    .eq("id", user.id)
    .maybeSingle();

  if (pErr || !profile) {
    redirect(`/listings/${listingId}?error=Complete your profile before leaving a review.`);
  }

  const reviewer_display_name =
    profile.full_name?.trim() ||
    profile.company_name?.trim() ||
    `Verified contractor ${user.id.slice(0, 4)}`;

  const { data: trade, error: tErr } = await supabase
    .from("payment_agreements")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .in("status", ["signed", "active", "completed"])
    .maybeSingle();

  if (tErr || !trade) {
    redirect(`/listings/${listingId}?error=Agreement linkage missing—refresh or contact support.`);
  }

  const is_verified_trade = true;

  const { error: insErr } = await supabase.from("listing_reviews").insert({
    listing_id: listingId,
    reviewer_id: user.id,
    reviewer_display_name,
    reviewer_company: profile.company_name?.trim() ?? null,
    rating,
    headline: headline.length > 0 ? headline : null,
    body,
    is_verified_trade,
  });

  if (insErr) {
    redirect(
      `/listings/${listingId}?error=${encodeURIComponent(insErr.message ?? "Unable to publish review.")}`
    );
  }

  redirect(`/listings/${listingId}?review=posted`);
}
