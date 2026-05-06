import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Json } from "@/lib/supabase/database.types";

const PG_UNIQUE = "23505";

export const NS_LISTING_CELL_LIVE = "north_star.listing_supply_cell_live";
export const NS_AGREEMENT_EXECUTABLE = "north_star.agreement_executable";
export const NS_FIRST_INSTALLMENT_PAID = "north_star.first_installment_paid";
export const NS_DEPOSIT_PAID = "north_star.deposit_paid";

/** Two-letter upper state bucket; unknown GEO uses "__" until you ingest MSAs/ZIPs. */
export function buildLiquidityCellKey(stateRaw: string | null | undefined, categoryRaw: string): string {
  const category = slugifySegment(categoryRaw);
  const st = normalizeStateBucket(stateRaw);
  return `${st}|${category}`;
}

function normalizeStateBucket(stateRaw: string | null | undefined): string {
  const s = (stateRaw ?? "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (s.length >= 2) {
    return s.slice(0, 2);
  }
  return "__";
}

export function slugifySegment(label: string): string {
  const s = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return (s.length > 0 ? s : "uncategorized").slice(0, 64);
}

export async function fetchLiquidityContextForListing(
  supabase: SupabaseClient<Database>,
  listingId: string
): Promise<{ listing_id: string; liquidity_cell: string; category: string; location_state: string | null } | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("id, location_state, category")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const liquidity_cell = buildLiquidityCellKey(data.location_state, data.category);
  return {
    listing_id: data.id,
    liquidity_cell,
    category: data.category,
    location_state: data.location_state,
  };
}

async function insertLiquidityMilestone(params: {
  supabase: SupabaseClient<Database>;
  eventType: string;
  liquidity_cell: string;
  dedupeKey: string;
  listing_id?: string | null;
  agreement_id?: string | null;
  agreement_payment_id?: string | null;
  actor_id?: string | null;
  metadata?: Json;
}) {
  const payload: Database["public"]["Tables"]["liquidity_milestones"]["Insert"] = {
    event_type: params.eventType,
    liquidity_cell: params.liquidity_cell,
    dedupe_key: params.dedupeKey,
    listing_id: params.listing_id ?? null,
    agreement_id: params.agreement_id ?? null,
    agreement_payment_id: params.agreement_payment_id ?? null,
    actor_id: params.actor_id ?? null,
    metadata: (params.metadata ?? {}) as Database["public"]["Tables"]["liquidity_milestones"]["Insert"]["metadata"],
  };

  const { error } = await params.supabase.from("liquidity_milestones").insert(payload);

  if (error?.code === PG_UNIQUE) {
    return { inserted: false as const };
  }
  if (error) {
    throw new Error(`liquidity_milestones insert: ${error.message}`);
  }

  return { inserted: true as const };
}

export async function recordListingSupplyCellLive(input: {
  supabase: SupabaseClient<Database>;
  listingId: string;
  actorId: string | null;
}) {
  const ctx = await fetchLiquidityContextForListing(input.supabase, input.listingId);
  if (!ctx) {
    return { skipped: true as const, reason: "listing_not_found" as const };
  }

  const meta = {
    listing_category: ctx.category,
    listing_state_raw: ctx.location_state,
  } satisfies Record<string, Json>;

  return insertLiquidityMilestone({
    supabase: input.supabase,
    eventType: NS_LISTING_CELL_LIVE,
    liquidity_cell: ctx.liquidity_cell,
    dedupeKey: `listing_supply:${input.listingId}`,
    listing_id: input.listingId,
    actor_id: input.actorId,
    metadata: meta,
  });
}

export async function recordAgreementExecutableInCell(input: {
  supabase: SupabaseClient<Database>;
  agreementId: string;
  actorId: string | null;
}) {
  const { data: row, error } = await input.supabase
    .from("payment_agreements")
    .select("id, listing_id")
    .eq("id", input.agreementId)
    .maybeSingle();

  if (error || !row) {
    return { skipped: true as const, reason: "agreement_not_found" as const };
  }

  const listingCtx = await fetchLiquidityContextForListing(input.supabase, row.listing_id);
  if (!listingCtx) {
    return { skipped: true as const, reason: "listing_not_found" as const };
  }

  const meta = {
    listing_id: row.listing_id,
    activation: "signed_with_schedule_ready",
    listing_category: listingCtx.category,
    listing_state_raw: listingCtx.location_state,
  } satisfies Record<string, Json>;

  return insertLiquidityMilestone({
    supabase: input.supabase,
    eventType: NS_AGREEMENT_EXECUTABLE,
    liquidity_cell: listingCtx.liquidity_cell,
    dedupeKey: `agreement_executable:${input.agreementId}`,
    listing_id: row.listing_id,
    agreement_id: input.agreementId,
    actor_id: input.actorId,
    metadata: meta,
  });
}

export async function recordDepositPaidIfEligible(input: {
  supabase: SupabaseClient<Database>;
  agreementId: string;
  installmentId: string;
  purpose: "deposit" | "installment";
}) {
  if (input.purpose !== "deposit") {
    return { skipped: true as const, reason: "not_deposit" as const };
  }

  const { data: agg, error: aErr } = await input.supabase
    .from("payment_agreements")
    .select("id, listing_id")
    .eq("id", input.agreementId)
    .maybeSingle();

  if (aErr || !agg) {
    return { skipped: true as const, reason: "agreement_not_found" as const };
  }

  const listingCtx = await fetchLiquidityContextForListing(input.supabase, agg.listing_id);
  if (!listingCtx) {
    return { skipped: true as const, reason: "listing_not_found" as const };
  }

  const meta = {
    listing_id: agg.listing_id,
    agreement_payment_id: input.installmentId,
    milestone: NS_DEPOSIT_PAID,
  } satisfies Record<string, Json>;

  return insertLiquidityMilestone({
    supabase: input.supabase,
    eventType: NS_DEPOSIT_PAID,
    liquidity_cell: listingCtx.liquidity_cell,
    dedupeKey: `deposit_paid:${input.agreementId}`,
    listing_id: agg.listing_id,
    agreement_id: input.agreementId,
    agreement_payment_id: input.installmentId,
    actor_id: null,
    metadata: meta,
  });
}

export async function recordFirstInstallmentPaidIfEligible(input: {
  supabase: SupabaseClient<Database>;
  agreementId: string;
  installmentId: string;
}) {
  const { data: paidSelf, error: selfErr } = await input.supabase
    .from("agreement_payments")
    .select("purpose")
    .eq("id", input.installmentId)
    .eq("agreement_id", input.agreementId)
    .eq("status", "paid")
    .maybeSingle();

  if (selfErr) {
    throw new Error(`first installment row: ${selfErr.message}`);
  }
  if (!paidSelf || paidSelf.purpose !== "installment") {
    return { skipped: true as const, reason: "not_installment_payment" as const };
  }

  const { count, error: cntErr } = await input.supabase
    .from("agreement_payments")
    .select("*", { count: "exact", head: true })
    .eq("agreement_id", input.agreementId)
    .eq("status", "paid")
    .eq("purpose", "installment");

  if (cntErr) {
    throw new Error(`first installment count: ${cntErr.message}`);
  }

  if (count !== 1) {
    return { skipped: true as const, reason: count === 0 ? "no_paid_rows" : "not_first_installment" as const };
  }

  const { data: agg, error: aErr } = await input.supabase
    .from("payment_agreements")
    .select("id, listing_id")
    .eq("id", input.agreementId)
    .maybeSingle();

  if (aErr || !agg) {
    return { skipped: true as const, reason: "agreement_not_found" as const };
  }

  const listingCtx = await fetchLiquidityContextForListing(input.supabase, agg.listing_id);
  if (!listingCtx) {
    return { skipped: true as const, reason: "listing_not_found" as const };
  }

  const meta = {
    listing_id: agg.listing_id,
    installment_id: input.installmentId,
    milestone: NS_FIRST_INSTALLMENT_PAID,
  } satisfies Record<string, Json>;

  return insertLiquidityMilestone({
    supabase: input.supabase,
    eventType: NS_FIRST_INSTALLMENT_PAID,
    liquidity_cell: listingCtx.liquidity_cell,
    dedupeKey: `first_installment:${input.agreementId}`,
    listing_id: agg.listing_id,
    agreement_id: input.agreementId,
    agreement_payment_id: input.installmentId,
    actor_id: null,
    metadata: meta,
  });
}

/** Admin dashboards / BI previews — callers must gate with `requireRole(['admin'])`. */
export async function getRecentLiquidityMilestones(
  supabase: SupabaseClient<Database>,
  limit = 25
): Promise<Database["public"]["Tables"]["liquidity_milestones"]["Row"][]> {
  const { data, error } = await supabase
    .from("liquidity_milestones")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`liquidity_milestones fetch: ${error.message}`);
  }

  return data ?? [];
}
