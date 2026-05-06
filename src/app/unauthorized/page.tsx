import Link from "next/link";
import { authRoutes } from "@/lib/navigation";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center px-4 py-10">
      <div className="panel-elevated w-full rounded-2xl p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Account security</p>
        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-foreground">This workspace requires a different role</h1>
        <p className="mt-4 text-base font-medium leading-relaxed text-muted">
          You are signed in, but this route is limited to the role assigned at registration. Sellers should open a seller
          account; buyers use the buyer dashboard. Administrators are provisioned internally.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-opacity hover:opacity-95"
          >
            Return home
          </Link>
          <Link
            href={authRoutes.account}
            className="inline-flex justify-center rounded-md border border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--card)]"
          >
            Account hub
          </Link>
          <Link
            href={`${authRoutes.signUp}?role=seller`}
            className="inline-flex justify-center rounded-md border border-[var(--steel-line)] px-4 py-2.5 text-sm font-semibold text-[var(--link)] underline-offset-4 hover:underline sm:border-transparent sm:underline"
          >
            Register as seller
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex justify-center px-4 py-2.5 text-sm font-semibold text-[var(--link)] underline-offset-4 hover:underline sm:underline"
          >
            Browse marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
