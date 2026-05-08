import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type ArtifactRow = Database["public"]["Tables"]["agreement_contract_artifacts"]["Row"];

export async function listContractArtifactsForAgreement(
  supabase: SupabaseClient<Database>,
  agreementId: string,
): Promise<ArtifactRow[]> {
  const { data, error } = await supabase
    .from("agreement_contract_artifacts")
    .select("*")
    .eq("agreement_id", agreementId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`contract artifacts: ${error.message}`);
  }

  return data ?? [];
}

export async function listContractArtifactsForAgreements(
  supabase: SupabaseClient<Database>,
  agreementIds: string[],
): Promise<Map<string, ArtifactRow[]>> {
  const map = new Map<string, ArtifactRow[]>();
  if (agreementIds.length === 0) return map;

  const { data, error } = await supabase
    .from("agreement_contract_artifacts")
    .select("*")
    .in("agreement_id", agreementIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`contract artifacts batch: ${error.message}`);
  }

  for (const row of data ?? []) {
    const list = map.get(row.agreement_id) ?? [];
    list.push(row);
    map.set(row.agreement_id, list);
  }

  for (const [aid, rows] of map) {
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    map.set(aid, rows);
  }

  return map;
}
