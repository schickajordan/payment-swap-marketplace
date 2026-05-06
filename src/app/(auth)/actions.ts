"use server";

import { redirect } from "next/navigation";
import { sanitizeAppPath } from "@/lib/auth/sanitize-app-path";
import { authRoutes } from "@/lib/navigation";
import { ensureMyProfile } from "@/lib/profiles/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_ROLE, isUserRole } from "@/lib/types/roles";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`${authRoutes.signIn}?error=${encodeURIComponent(error.message)}`);
  }

  const roleCandidate = data.user?.user_metadata?.role;
  const role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;
  await ensureMyProfile({ role });

  const next = sanitizeAppPath(formData.get("next"));
  redirect(next ?? "/");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullNameRaw = String(formData.get("fullName") ?? "").trim();
  const roleCandidate = formData.get("role");
  const allowAdminSignUp = process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true";
  let role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;
  if (!allowAdminSignUp && role === "admin") {
    role = DEFAULT_ROLE;
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(fullNameRaw ? { full_name: fullNameRaw } : {}),
      },
    },
  });

  if (error) {
    redirect(`${authRoutes.signUp}?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await ensureMyProfile({ role, fullName: fullNameRaw || undefined });
  }

  redirect(`${authRoutes.signIn}?success=account-created&hint=confirm-email`);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(authRoutes.signIn);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();

  const supabase = await createServerSupabaseClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getCanonicalSiteUrl()}${authRoutes.updatePassword}`,
  });

  redirect(`${authRoutes.forgotPassword}?success=sent`);
}

export async function signInWithGoogleAction(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const next = sanitizeAppPath(formData.get("next")) ?? authRoutes.account;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getCanonicalSiteUrl()}${authRoutes.oauthCallback}?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    redirect(`${authRoutes.signIn}?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.url) {
    redirect(`${authRoutes.signIn}?error=oauth`);
  }

  redirect(data.url);
}
