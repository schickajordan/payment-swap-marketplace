import { DEFAULT_ROLE, isUserRole, UserRole } from "@/lib/types/roles";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCurrentSession() {
  if (!isSupabaseConfigured()) {
    return { user: null, role: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { user: null, role: null };
  }

  const roleCandidate = data.user.user_metadata?.role;
  const role: UserRole = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;

  return { user: data.user, role };
}
