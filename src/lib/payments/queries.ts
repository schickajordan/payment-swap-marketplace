import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type AgreementPaymentRow = Database["public"]["Tables"]["agreement_payments"]["Row"];

export async function getMyUpcomingAgreementPayments(limit = 24): Promise<AgreementPaymentRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: myAgreements, error: agErr } = await supabase
    .from("payment_agreements")
    .select("id")
    .eq("buyer_id", user.id);

  if (agErr) {
    throw new Error(`Failed to resolve buyer agreements: ${agErr.message}`);
  }

  const agreementIds = (myAgreements ?? []).map((r) => r.id);
  if (agreementIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("agreement_payments")
    .select("*")
    .in("agreement_id", agreementIds)
    .in("status", ["scheduled", "processing", "failed"])
    .order("due_date", { ascending: true })
    .order("purpose", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load upcoming payments: ${error.message}`);
  }

  return data ?? [];
}

export async function getPaymentRollupsByAgreementIds(
  agreementIds: string[]
): Promise<Map<string, { paid: number; scheduledOrOpen: number }>> {
  const map = new Map<string, { paid: number; scheduledOrOpen: number }>();
  if (agreementIds.length === 0) return map;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("agreement_payments")
    .select("agreement_id, status")
    .in("agreement_id", agreementIds);

  if (error) {
    throw new Error(`Failed to load payment rollup: ${error.message}`);
  }

  for (const row of data ?? []) {
    const curr = map.get(row.agreement_id) ?? { paid: 0, scheduledOrOpen: 0 };
    if (row.status === "paid") curr.paid += 1;
    else curr.scheduledOrOpen += 1;
    map.set(row.agreement_id, curr);
  }

  return map;
}
