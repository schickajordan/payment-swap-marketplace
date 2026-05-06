import Link from "next/link";
import { signInWithGoogleAction, signUpAction } from "@/app/(auth)/actions";
import { authRoutes } from "@/lib/navigation";

const allowPublicAdminSignUp = process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true";

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold text-white">Create your business account</h1>
        <p className="mt-2 text-sm text-slate-300">
          Pick buyer or seller—both are free to start. You&apos;ll confirm your email, then land in the right dashboard
          to browse, list equipment, or finish payout setup. Admin access stays invite-only in production.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          New here? Read{" "}
          <Link href="/about" className="font-semibold text-gold hover:text-[#ffd14d]">
            how rent / lease / buy works
          </Link>{" "}
          and{" "}
          <Link href="/about#verification" className="font-semibold text-gold hover:text-[#ffd14d]">
            how verification works
          </Link>
          .
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
            {params.error}
          </p>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-6">
          <input type="hidden" name="next" value={authRoutes.account} />
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

        <form action={signUpAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Display name (optional)
            <input
              type="text"
              name="fullName"
              maxLength={200}
              placeholder="How we greet you in threads"
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
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
              minLength={8}
              required
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Account role
            <select
              name="role"
              defaultValue="buyer"
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              {allowPublicAdminSignUp ?
                <option value="admin">Admin (staging only)</option>
              : null}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Already have an account?{" "}
          <Link href={authRoutes.signIn} className="font-semibold text-gold hover:text-[#ffd14d]">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
