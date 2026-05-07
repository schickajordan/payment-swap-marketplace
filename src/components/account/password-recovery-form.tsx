"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRoutes } from "@/lib/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";

export function PasswordRecoveryForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recoveryHint, setRecoveryHint] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClientSupabaseClient();

    supabase.auth
      .getSession()
      .then(() => {
        /** Hash / PKCE fragments are hydrated by the client runtime on first tick. */
      })
      .catch(() => {});

    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryHint(null);
      }
    });

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecoveryHint(
        "If you came from email and get “session missing”, open the newest link—or request another reset.",
      );
    }, 2800);

    return () => window.clearTimeout(timer);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createClientSupabaseClient();
    const trimmed = password.trim();

    if (trimmed.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({ password: trimmed });
    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    router.push(`${authRoutes.signIn}?success=password-reset`);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-[#071733] p-6 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold text-white">Choose a new password</h1>
        <p className="mt-2 text-sm text-slate-300">
          Use this page after opening the password-reset link from your email (same browser you started from is ideal).
        </p>

        {error ?
          <p className="mt-4 rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
            {error}
          </p>
        : null}
        {recoveryHint && !error ?
          <p className="mt-4 rounded-md border border-amber-300/35 bg-amber-500/10 p-2 text-xs text-amber-100">
            {recoveryHint}
          </p>
        : null}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            New password
            <input
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              minLength={8}
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
          >
            Update password
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-400">
          <Link href={authRoutes.forgotPassword} className="font-semibold text-gold hover:underline">
            Request another reset
          </Link>{" "}
          ·{" "}
          <Link href={authRoutes.signIn} className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
