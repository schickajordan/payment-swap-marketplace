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
  "account-created": "Account created. Sign in to continue.",
  "password-reset": "Password updated. Sign in with your new password.",
  "account-deleted": "Your account has been permanently deleted.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const successMessage =
    params.success && successCopy[params.success] ? successCopy[params.success] : null;
  const googleNext = sanitizeAppPath(params.next) ?? authRoutes.account;
  const nextPath = sanitizeAppPath(params.next);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="panel-elevated rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sign in with the business credentials issued at registration. Operational staff use separate onboarding.
        </p>
        {nextPath ? (
          <p className="mt-2 text-xs font-semibold text-foreground">
            After sign-in: <span className="font-mono text-[13px] font-normal text-muted">{nextPath}</span>
          </p>
        ) : null}

        {params.error ? (
          <p className="mt-4 rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
            {params.error}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 rounded-md border-l-4 border-emerald-700 bg-[var(--card-muted)] p-3 text-sm font-medium text-foreground">
            {successMessage}
          </p>
        ) : null}

        {params.hint === "confirm-email" ? (
          <p className="mt-3 rounded-md border-l-4 border-amber-600 bg-[var(--card-muted)] p-3 text-xs font-medium leading-relaxed text-foreground">
            If Supabase requires email confirmation, finish the inbox link before seller or buyer workspaces unlock.
          </p>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-6">
          <input type="hidden" name="next" value={googleNext} />
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--input-border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--card)]"
          >
            Continue with Google
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--steel-line)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">or email</span>
          <div className="h-px flex-1 bg-[var(--steel-line)]" />
        </div>

        <form action={signInAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={params.next ?? ""} />
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="input-field rounded-md px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="input-field rounded-md px-3 py-2.5"
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={authRoutes.forgotPassword}
              className="text-xs font-semibold text-[var(--link)] underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-opacity hover:opacity-95 active:translate-y-px"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          No account yet?{" "}
          <Link href={authRoutes.signUp} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            Register your business
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
