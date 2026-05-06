import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dealTemplateLabel } from "@/lib/listings/deal-template";
import { Database } from "@/lib/supabase/database.types";
import { createAgreementEvent } from "@/lib/events/queries";
import { ensureMessageThreadForAgreement, postThreadMessage } from "@/lib/messaging/queries";

type AgreementRow = Database["public"]["Tables"]["payment_agreements"]["Row"];
type AgreementInsert = Database["public"]["Tables"]["payment_agreements"]["Insert"];

type AdminQueueListing = Pick<
  Database["public"]["Tables"]["listings"]["Row"],
  "title" | "category" | "location_city" | "location_state" | "deal_template" | "collateral_is_titled"
>;

export type AdminAgreementQueueItem = AgreementRow & {
  listings: AdminQueueListing | null;
};

export type BuyerQualificationSnapshot = {
  acknowledged_lender_approval: boolean;
  acknowledged_transfer_restrictions: boolean;
  acknowledged_fee_responsibility: boolean;
  transfer_fee_party: "buyer" | "seller" | "split" | "negotiated";
};

export async function getMyBuyerAgreements(): Promise<AgreementRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payment_agreements")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch buyer agreements: ${error.message}`);
  }

  return data ?? [];
}

export async function getMySellerAgreements(): Promise<AgreementRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payment_agreements")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch seller agreements: ${error.message}`);
  }

  return data ?? [];
}

export async function createDraftAgreementForListing(
  listingId: string,
  qualification?: BuyerQualificationSnapshot
) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to apply for a listing.");
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, monthly_payment_cents, status, deal_template, collateral_is_titled")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    throw new Error("Listing not found.");
  }

  if (listing.seller_id === user.id) {
    throw new Error("You cannot apply to your own listing.");
  }

  if (listing.status !== "active") {
    throw new Error("Only active listings can receive applications.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("payment_agreements")
    .select("id")
    .eq("listing_id", listing.id)
    .eq("buyer_id", user.id)
    .in("status", ["draft", "signed", "active"])
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check existing agreement: ${existingError.message}`);
  }

  if (existing) {
    throw new Error("You already have an active application for this listing.");
  }

  const payload: AgreementInsert = {
    listing_id: listing.id,
    seller_id: listing.seller_id,
    buyer_id: user.id,
    status: "draft",
    monthly_payment_cents: listing.monthly_payment_cents,
    escrow_enabled: true,
  };

  const { data, error } = await supabase
    .from("payment_agreements")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create agreement draft: ${error.message}`);
  }

  await createAgreementEvent({
    agreementId: data.id,
    eventType: "application_submitted",
    message: "Buyer submitted a swap application.",
    metadata: {
      listing_id: listing.id,
      seller_id: listing.seller_id,
      buyer_id: user.id,
      deal_template: listing.deal_template,
      collateral_is_titled: listing.collateral_is_titled,
      qualification_snapshot: qualification ?? null,
    },
  });

  const lane = dealTemplateLabel(listing.deal_template);
  const titledNote = listing.collateral_is_titled ? "titled / VIN verification path" : "serial / lien documentation path";

  const thread = await ensureMessageThreadForAgreement(data.id, user.id);
  const qualificationLine = qualification
    ? `Pre-apply checks: lender approval acknowledged, restriction risk acknowledged, fee responsibility=${qualification.transfer_fee_party}.`
    : "Pre-apply checks: captured in listing workflow when required.";
  await postThreadMessage(
    thread.id,
    `Application submitted — ${lane} · ${titledNote}. ${qualificationLine} Use this thread for lender packets, insurance certs, and handoff milestones alongside the seller and platform team.`
  );

  return data;
}

export async function getAdminAgreementQueue(): Promise<AdminAgreementQueueItem[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payment_agreements")
    .select(
      "id, listing_id, seller_id, buyer_id, status, deal_checkpoint, start_date, end_date, monthly_payment_cents, escrow_enabled, signed_contract_url, created_at, updated_at, listings(title, category, location_city, location_state, deal_template, collateral_is_titled)"
    )
    .in("status", ["draft", "signed", "active", "defaulted"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch admin agreement queue: ${error.message}`);
  }

  return (data ?? []) as AdminAgreementQueueItem[];
}

export async function updateAgreementStatus(
  agreementId: string,
  status: AgreementRow["status"]
) {
  const supabase = await createServerSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("payment_agreements")
    .select("id, status")
    .eq("id", agreementId)
    .single();

  if (existingError || !existing) {
    throw new Error("Agreement not found for update.");
  }

  const { error } = await supabase
    .from("payment_agreements")
    .update({ status })
    .eq("id", agreementId);

  if (error) {
    throw new Error(`Failed to update agreement status: ${error.message}`);
  }

  await createAgreementEvent({
    agreementId,
    eventType: "status_updated",
    message: `Agreement status changed from ${existing.status} to ${status}.`,
    metadata: {
      from_status: existing.status,
      to_status: status,
    },
  });
}

/** If still at default intake (e.g. new application), move to first ops milestone once. */
export async function advanceDealCheckpointFromIntake(
  agreementId: string,
  next: AgreementRow["deal_checkpoint"]
) {
  const supabase = await createServerSupabaseClient();
  const { data: existing, error } = await supabase
    .from("payment_agreements")
    .select("deal_checkpoint")
    .eq("id", agreementId)
    .single();

  if (error || !existing || existing.deal_checkpoint !== "intake") {
    return;
  }

  await updateAgreementDealCheckpoint(agreementId, next);
}

export async function updateAgreementDealCheckpoint(
  agreementId: string,
  deal_checkpoint: AgreementRow["deal_checkpoint"]
) {
  const supabase = await createServerSupabaseClient();
  const { data: existing, error: existingError } = await supabase
    .from("payment_agreements")
    .select("id, deal_checkpoint")
    .eq("id", agreementId)
    .single();

  if (existingError || !existing) {
    throw new Error("Agreement not found for checkpoint update.");
  }

  if (existing.deal_checkpoint === deal_checkpoint) {
    return;
  }

  const { error } = await supabase
    .from("payment_agreements")
    .update({ deal_checkpoint })
    .eq("id", agreementId);

  if (error) {
    throw new Error(`Failed to update deal checkpoint: ${error.message}`);
  }

  await createAgreementEvent({
    agreementId,
    eventType: "deal_checkpoint_updated",
    message: `Operational checkpoint: ${existing.deal_checkpoint} → ${deal_checkpoint}.`,
    metadata: {
      from_checkpoint: existing.deal_checkpoint,
      to_checkpoint: deal_checkpoint,
    },
  });
}
