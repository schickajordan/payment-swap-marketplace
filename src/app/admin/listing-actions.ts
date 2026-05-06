"use server";

import { redirect } from "next/navigation";
import { recordListingSupplyCellLive } from "@/lib/analytics/liquidity-milestones";
import { requireRole } from "@/lib/auth/authorization";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

export async function approveListingAction(formData: FormData) {
  await requireRole(["admin"]);
  const listingId = String(formData.get("listingId") ?? "").trim();

  if (!listingId) {
    redirect("/admin?error=Missing listing id.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("listings").update({ status: "active" }).eq("id", listingId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  await recordListingSupplyCellLive({
    supabase,
    listingId,
    actorId: user?.id ?? null,
  });

  redirect("/admin?success=listing-approved");
}

export async function rejectListingAction(formData: FormData) {
  await requireRole(["admin"]);
  const listingId = String(formData.get("listingId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();

  if (!listingId || !reason) {
    redirect("/admin?error=Listing rejection requires a reason.");
  }

  const supabase = await createServerSupabaseClient();
  const { data: row, error: fetchError } = await supabase
    .from("listings")
    .select("metadata")
    .eq("id", listingId)
    .single();

  if (fetchError || !row) {
    redirect(`/admin?error=${encodeURIComponent(fetchError?.message ?? "Listing not found.")}`);
  }

  const prior = row.metadata;
  const base =
    prior && typeof prior === "object" && !Array.isArray(prior)
      ? (prior as Record<string, Json>)
      : {};
  const nextMeta: Json = {
    ...base,
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("listings")
    .update({ status: "flagged", metadata: nextMeta })
    .eq("id", listingId);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin?success=listing-rejected");
}
