import { resolveEffectiveRole } from "@/lib/auth/resolve-effective-role";
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

  const role = await resolveEffectiveRole(supabase, data.user.id, data.user.user_metadata?.role);

  return { user: data.user, role };
}
