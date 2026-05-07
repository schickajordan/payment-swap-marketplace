import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { DEFAULT_ROLE, isUserRole, type UserRole } from "@/lib/types/roles";

/**
 * Authoritative role for routing and `requireRole`: `profiles.role` when present,
 * otherwise `auth.users.raw_user_meta_data->role` (e.g. before first profile row).
 */
export async function resolveEffectiveRole(
  supabase: SupabaseClient<Database>,
  userId: string,
  metadataRole: unknown,
): Promise<UserRole> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!error && profile?.role && isUserRole(profile.role)) {
    return profile.role;
  }

  if (isUserRole(metadataRole)) {
    return metadataRole;
  }

  return DEFAULT_ROLE;
}
