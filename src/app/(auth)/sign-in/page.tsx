import Link from "next/link";
import { signInAction, signInWithGoogleAction } from "@/app/(auth)/actions";
import { sanitizeAppPath } from "@/lib/auth/sanitize-app-path";
import { authRoutes } from "@/lib/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    hint?: string;
    next?: string;
  }>;
};

const successCopy: Record<string, string> = {
  "account-created": "Account created. You can sign in now.",
  "password-reset": "Password updated. Sign in with your new password.",
  "account-deleted": "Your account has been permanently deleted.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const successMessage =
    params.success && successCopy[params.success] ? successCopy[params.success] : null;
  const googleNext = sanitizeAppPath(params.next) ?? authRoutes.account;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-slate-300">
          Access your Payment Swap Marketplace dashboard or open your{" "}
          <Link href={authRoutes.account} className="font-semibold text-gold hover:text-[#ffd14d]">
            account hub
          </Link>
          .
        </p>

        {params.error ?
          <p className="mt-4 rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
            {params.error}
          </p>
        : null}

        {successMessage ?
          <p className="mt-4 rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
            {successMessage}
          </p>
        : null}

        {params.hint === "confirm-email" ?
          <p className="mt-3 rounded-md border border-amber-300/35 bg-amber-500/10 p-2 text-xs text-amber-100">
            If your project requires email confirmation in Supabase, finish the inbox link before some dashboards
            unlock.
          </p>
        : null}

        <form action={signInWithGoogleAction} className="mt-6">
          <input type="hidden" name="next" value={googleNext} />
          <button
            type="submit"
            className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Continue with Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] uppercase tracking-widest text-slate-500">or email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form action={signInAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={params.next ?? ""} />
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Password
            <input
              type="password"
              name="password"
              required
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={authRoutes.forgotPassword} className="text-xs font-semibold text-gold hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          No account yet?{" "}
          <Link href={authRoutes.signUp} className="font-semibold text-gold hover:text-[#ffd14d]">
            Create one
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
