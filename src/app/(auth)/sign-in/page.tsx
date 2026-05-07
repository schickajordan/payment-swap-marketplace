import Link from "next/link";
import { signInWithGoogleAction } from "@/app/(auth)/actions";
import { SignInEmailForm } from "@/components/auth/sign-in-email-form";
import { HostingConfigBanner } from "@/components/layout/hosting-config-banner";
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
  "account-created":
    "We sent a confirmation link if your project requires email verification. Finish that email, then sign in below.",
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
    <>
      <HostingConfigBanner />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="panel-elevated rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Use the email and password you registered. If email confirmation is on in Supabase, you must complete the
          inbox link once before passwords work here.
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
          <ol className="mt-3 list-decimal space-y-2 rounded-md border-l-4 border-amber-600 bg-[var(--card-muted)] p-3 ps-8 text-xs font-medium leading-relaxed text-foreground marker:font-semibold">
            <li>Open the verification email from your auth provider.</li>
            <li>
              Click confirm — you should return here on <span className="font-mono text-[11px]">/account</span> or the
              home page.
            </li>
            <li>Return here and sign in—then buyer or seller tools unlock.</li>
          </ol>
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

        <SignInEmailForm nextQueryValue={typeof params.next === "string" ? params.next : ""} />

        <p className="mt-4 text-sm text-muted">
          No account yet?{" "}
          <Link href={authRoutes.signUp} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            Register your business
          </Link>
          .
        </p>
      </div>
    </main>
    </>
  );
}
