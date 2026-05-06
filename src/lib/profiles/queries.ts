import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";
import { UserRole } from "@/lib/types/roles";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type UserAddressRow = Database["public"]["Tables"]["user_addresses"]["Row"];

type EnsureProfileInput = {
  role: UserRole;
  fullName?: string;
  companyName?: string;
  phone?: string;
};

export async function ensureMyProfile(input: EnsureProfileInput) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found for profile creation.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check profile existence: ${existingError.message}`);
  }

  if (existing) {
    return;
  }

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    role: input.role,
    full_name: input.fullName ?? null,
    company_name: input.companyName ?? null,
    phone: input.phone ?? null,
  });

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
}

export async function getMyProfileRow(): Promise<ProfileRow | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data ?? null;
}

export async function listMyAddresses(): Promise<UserAddressRow[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load addresses: ${error.message}`);
  }

  return data ?? [];
}

