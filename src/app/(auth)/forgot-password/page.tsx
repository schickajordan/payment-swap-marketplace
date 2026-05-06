import Link from "next/link";
import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { authRoutes } from "@/lib/navigation";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const sp = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-card p-6 shadow-xl shadow-black/20">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-2 text-sm text-slate-300">
          We&apos;ll send a recovery link powered by Supabase Auth. If mail is suppressed in local dev, use the SMTP
          test inbox from your dashboard.
        </p>

        {sp.success === "sent" ?
          <p className="mt-4 rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
            Check your inbox (and spam) for reset instructions—the link expires quickly.
          </p>
        : null}

        <form action={requestPasswordResetAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            Email
            <input
              type="email"
              name="email"
              required
              className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
          >
            Email reset link
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-300">
          Remembered your password?{" "}
          <Link href={authRoutes.signIn} className="font-semibold text-gold hover:text-[#ffd14d]">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
