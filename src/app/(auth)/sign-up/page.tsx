import Link from "next/link";
import { signInWithGoogleAction } from "@/app/(auth)/actions";
import { SignUpEmailForm } from "@/components/auth/sign-up-email-form";
import { HostingConfigBanner } from "@/components/layout/hosting-config-banner";
import { authRoutes } from "@/lib/navigation";

const allowPublicAdminSignUp = process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true";

type SignUpPageProps = {
  searchParams: Promise<{
    error?: string;
    role?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const defaultRole = params.role === "seller" ? "seller" : "buyer";

  return (
    <>
      <HostingConfigBanner />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="panel-elevated rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          Create your business account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Pick buyer or seller. When your project sends a confirmation email, finish that link once—then{" "}
          <Link href={authRoutes.signIn} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            sign in
          </Link>{" "}
          with the password you chose. Admin access is invite-only in production.
        </p>

        <ol className="mt-4 space-y-1.5 rounded-md border border-[var(--input-border)] bg-[var(--card-muted)] px-4 py-3 text-xs leading-relaxed text-foreground [&>li]:ps-1">
          <li className="flex gap-2">
            <span className="font-display font-bold tabular-nums text-muted">1.</span>
            <span>
              Submit this form — we queue your account at the auth provider.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-display font-bold tabular-nums text-muted">2.</span>
            <span>Open the inbox (and spam folder) — click verify when your project requires it.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-display font-bold tabular-nums text-muted">3.</span>
            <span>Come back to sign in — your profile finishes on first successful login.</span>
          </li>
        </ol>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          New here? Read{" "}
          <Link href="/about" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            Deal types & playbook
          </Link>{" "}
          and{" "}
          <Link href="/about#verification" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            verification standards
          </Link>
          .
        </p>

        {params.error ? (
          <p className="mt-4 rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
            {params.error}
          </p>
        ) : null}

        <form action={signInWithGoogleAction} className="mt-6">
          <input type="hidden" name="next" value={authRoutes.account} />
          <button
            type="submit"
            className="w-full rounded-md border border-[var(--input-border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--card)]"
          >
            Continue with Google
          </button>
        </form>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          To register as a <span className="font-semibold text-foreground">seller</span>, use email sign-up below and
          select Seller—Google does not yet apply the role you pick here.
        </p>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--steel-line)]" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">or email</span>
          <div className="h-px flex-1 bg-[var(--steel-line)]" />
        </div>

        <SignUpEmailForm
          defaultRole={defaultRole}
          allowPublicAdminSignUp={allowPublicAdminSignUp}
        />

        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href={authRoutes.signIn} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
    </>
  );
}
