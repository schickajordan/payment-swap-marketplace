import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
  type LegalDocType,
} from "@/lib/legal/constants";
import type { Database } from "@/lib/supabase/database.types";

export async function hasCurrentLegalAcceptances(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("legal_acceptances")
    .select("doc_type, document_version")
    .eq("profile_id", profileId);

  if (error || !data) return false;

  const hasTerms = data.some(
    (row) => row.doc_type === "terms" && row.document_version === CURRENT_TERMS_VERSION,
  );
  const hasPrivacy = data.some(
    (row) => row.doc_type === "privacy" && row.document_version === CURRENT_PRIVACY_VERSION,
  );
  return hasTerms && hasPrivacy;
}

export async function insertLegalAcceptance(
  supabase: SupabaseClient<Database>,
  profileId: string,
  docType: LegalDocType,
  documentVersion: string,
  source: string,
) {
  return supabase.from("legal_acceptances").insert({
    profile_id: profileId,
    doc_type: docType,
    document_version: documentVersion,
    source,
  });
}
