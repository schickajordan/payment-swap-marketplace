"use server";

import { redirect } from "next/navigation";
import type { AuthCredentialFormState, ForgotEmailFormState } from "@/lib/auth/auth-form-state";
import {
  isForgotEmailValidated,
  isSignInValidated,
  isSignUpValidated,
  validateForgotEmailForm,
  validateSignInForm,
  validateSignUpForm,
} from "@/lib/auth/auth-form-state";
import { sanitizeAppPath } from "@/lib/auth/sanitize-app-path";
import { authRoutes } from "@/lib/navigation";
import {
  hasCurrentLegalAcceptances,
  insertLegalAcceptance,
} from "@/lib/legal/acceptance";
import {
  CURRENT_PRIVACY_VERSION,
  CURRENT_TERMS_VERSION,
} from "@/lib/legal/constants";
import { ensureMyProfile } from "@/lib/profiles/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_ROLE, isUserRole } from "@/lib/types/roles";
import { getCanonicalSiteUrl } from "@/lib/seo/site-url";

export async function signInAction(
  _prevState: AuthCredentialFormState,
  formData: FormData,
): Promise<AuthCredentialFormState> {
  const checked = validateSignInForm(formData);
  if (!isSignInValidated(checked)) {
    return checked;
  }
  const { email, password } = checked;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { formError: error.message };
  }

  const roleCandidate = data.user?.user_metadata?.role;
  const role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;

  try {
    await ensureMyProfile({ role });
  } catch (profileErr) {
    const msg =
      profileErr instanceof Error ? profileErr.message : "Could not finish account setup.";
    return { formError: msg };
  }

  const next = sanitizeAppPath(formData.get("next"));
  const hasLegal = await hasCurrentLegalAcceptances(supabase, data.user.id);
  if (!hasLegal) {
    redirect(`${authRoutes.acceptLegal}?next=${encodeURIComponent(next ?? authRoutes.account)}`);
  }
  redirect(next ?? "/");
}

export async function signUpAction(
  _prevState: AuthCredentialFormState,
  formData: FormData,
): Promise<AuthCredentialFormState> {
  const validated = validateSignUpForm(formData);
  if (!isSignUpValidated(validated)) {
    return validated;
  }

  const { email, password, fullNameRaw, roleCandidate } = validated;
  const allowAdminSignUp = process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true";
  let role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;
  if (!allowAdminSignUp && role === "admin") {
    role = DEFAULT_ROLE;
  }

  const supabase = await createServerSupabaseClient();

  const site = getCanonicalSiteUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(fullNameRaw ? { full_name: fullNameRaw } : {}),
        legal_terms_version: CURRENT_TERMS_VERSION,
        legal_privacy_version: CURRENT_PRIVACY_VERSION,
      },
      /**
       * Lands the user on your domain after they click the inbox link. Must be listed in Supabase
       * Dashboard → Authentication → URL configuration → Redirect URLs.
       */
      emailRedirectTo: `${site}${authRoutes.account}`,
    },
  });

  if (error) {
    return { formError: error.message };
  }

  /**
   * When “Confirm email” is enabled in Supabase, `signUp` returns a user but often **no session** until
   * the inbox link is clicked. `ensureMyProfile` requires a session—running it here threw and broke signup.
   * Profile is created on first successful `signIn` (and OAuth callback) instead.
   */
  if (data.user && data.session) {
    try {
      await ensureMyProfile({ role, fullName: fullNameRaw || undefined });
    } catch (profileErr) {
      const msg =
        profileErr instanceof Error ? profileErr.message : "Could not create profile row.";
      return { formError: msg };
    }
    await insertLegalAcceptance(
      supabase,
      data.user.id,
      "terms",
      CURRENT_TERMS_VERSION,
      "signup_email",
    );
    await insertLegalAcceptance(
      supabase,
      data.user.id,
      "privacy",
      CURRENT_PRIVACY_VERSION,
      "signup_email",
    );
  }

  redirect(`${authRoutes.signIn}?success=account-created&hint=confirm-email`);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect(authRoutes.signIn);
}

export async function requestPasswordResetAction(
  _prevState: ForgotEmailFormState,
  formData: FormData,
): Promise<ForgotEmailFormState> {
  const checked = validateForgotEmailForm(formData);
  if (!isForgotEmailValidated(checked)) {
    return checked;
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.resetPasswordForEmail(checked.email, {
    redirectTo: `${getCanonicalSiteUrl()}${authRoutes.updatePassword}`,
  });

  if (error) {
    return { formError: error.message };
  }

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

export async function acceptLegalAction(formData: FormData) {
  const next = sanitizeAppPath(formData.get("next")) ?? authRoutes.account;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authRoutes.signIn);
  }

  const acceptedTerms = formData.get("termsAccepted") === "on";
  const acceptedPrivacy = formData.get("privacyAccepted") === "on";
  if (!acceptedTerms || !acceptedPrivacy) {
    redirect(`${authRoutes.acceptLegal}?error=consent-required&next=${encodeURIComponent(next)}`);
  }

  await insertLegalAcceptance(supabase, user.id, "terms", CURRENT_TERMS_VERSION, "reconsent_gate");
  await insertLegalAcceptance(supabase, user.id, "privacy", CURRENT_PRIVACY_VERSION, "reconsent_gate");

  redirect(next);
}
