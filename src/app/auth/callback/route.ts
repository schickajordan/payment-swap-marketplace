import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";
import { sanitizeAppPath } from "@/lib/auth/sanitize-app-path";
import { insertLegalAcceptance } from "@/lib/legal/acceptance";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal/constants";
import { authRoutes } from "@/lib/navigation";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { DEFAULT_ROLE, isUserRole } from "@/lib/types/roles";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  /** Same base for every redirect (matches post-OAuth `next` resolution, avoids path-as-base quirks). */
  const origin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeAppPath(requestUrl.searchParams.get("next")) ?? authRoutes.account;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL(
        `${authRoutes.signIn}?error=${encodeURIComponent("Server auth is not configured (missing Supabase URL or anon key).")}`,
        origin,
      ),
    );
  }

  const { url: supabaseUrl, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  if (!code) {
    return NextResponse.redirect(
      new URL(`${authRoutes.signIn}?error=${encodeURIComponent("Missing OAuth code.")}`, origin)
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`${authRoutes.signIn}?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const roleCandidate = user.user_metadata?.role;
    const role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;

    const { data: existing } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

    if (!existing) {
      const googleName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === "string"
            ? user.user_metadata.name
            : null;

      await supabase.from("profiles").insert({
        id: user.id,
        role,
        full_name: googleName,
      });
    }

    const termsMeta = user.user_metadata?.legal_terms_version;
    const privacyMeta = user.user_metadata?.legal_privacy_version;
    if (termsMeta === CURRENT_TERMS_VERSION && privacyMeta === CURRENT_PRIVACY_VERSION) {
      await insertLegalAcceptance(
        supabase,
        user.id,
        "terms",
        CURRENT_TERMS_VERSION,
        "oauth_metadata",
      );
      await insertLegalAcceptance(
        supabase,
        user.id,
        "privacy",
        CURRENT_PRIVACY_VERSION,
        "oauth_metadata",
      );
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
