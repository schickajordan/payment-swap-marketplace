import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type AgreementEventRow = Database["public"]["Tables"]["agreement_events"]["Row"];

export type QualificationSnapshot = {
  transferFeeParty: string;
  lenderApprovalAck: boolean;
  restrictionsAck: boolean;
  feeAck: boolean;
};

export function extractQualificationSnapshot(meta: unknown): QualificationSnapshot | null {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const snap = (meta as Record<string, unknown>).qualification_snapshot;
  if (!snap || typeof snap !== "object" || Array.isArray(snap)) return null;

  const row = snap as Record<string, unknown>;
  const transferFeeParty =
    typeof row.transfer_fee_party === "string" && row.transfer_fee_party.trim()
      ? row.transfer_fee_party.trim()
      : null;
  const lenderApprovalAck = row.acknowledged_lender_approval === true;
  const restrictionsAck = row.acknowledged_transfer_restrictions === true;
  const feeAck = row.acknowledged_fee_responsibility === true;
  if (!transferFeeParty) return null;
  return { transferFeeParty, lenderApprovalAck, restrictionsAck, feeAck };
}

export async function createAgreementEvent(input: {
  agreementId: string;
  eventType: string;
  message: string;
  metadata?: Database["public"]["Tables"]["agreement_events"]["Insert"]["metadata"];
  isInternal?: boolean;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("agreement_events").insert({
    agreement_id: input.agreementId,
    actor_id: user?.id ?? null,
    event_type: input.eventType,
    message: input.message,
    metadata: input.metadata ?? {},
    is_internal: input.isInternal ?? false,
  });

  if (error) {
    throw new Error(`Failed to create agreement event: ${error.message}`);
  }
}

export async function getAdminAgreementEvents(limit = 50): Promise<AgreementEventRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("agreement_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch agreement events: ${error.message}`);
  }

  return data ?? [];
}

export async function getNonInternalAgreementEventsByAgreementIds(
  agreementIds: string[]
): Promise<Map<string, AgreementEventRow[]>> {
  const map = new Map<string, AgreementEventRow[]>();
  if (agreementIds.length === 0) return map;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("agreement_events")
    .select("*")
    .in("agreement_id", agreementIds)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch agreement events: ${error.message}`);
  }

  for (const row of data ?? []) {
    const list = map.get(row.agreement_id) ?? [];
    list.push(row);
    map.set(row.agreement_id, list);
  }

  return map;
}
