import Link from "next/link";
import { authRoutes } from "@/lib/navigation";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-card p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">
          Access restricted
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">Unauthorized</h1>
        <p className="mt-3 text-slate-300">
          Your account role does not currently have access to this dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-[#071733] transition-colors hover:bg-[#ffd14d] active:translate-y-px"
          >
            Back to home
          </Link>
          <Link
            href={authRoutes.account}
            className="inline-flex justify-center rounded-md border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-gold/40 hover:bg-white/5"
          >
            Account hub
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex justify-center rounded-md border border-transparent px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:text-[#ffd14d]"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
