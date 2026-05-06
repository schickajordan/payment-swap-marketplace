export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(String(url ?? "").trim() && String(anonKey ?? "").trim());
}

/**
 * Never throws — empty strings mean “not configured”. Callers that require auth should use
 * `isSupabaseConfigured()` or handle Supabase API errors. Throwing here took down whole pages in production
 * when Vercel env vars were missing.
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = String(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  return { url, anonKey };
}
