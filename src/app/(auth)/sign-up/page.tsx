import Link from "next/link";
import { signInWithGoogleAction, signUpAction } from "@/app/(auth)/actions";
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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="panel-elevated rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          Create your business account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Choose buyer or seller. After email confirmation, you&apos;ll use the matching dashboard to browse inventory or
          publish listings. Operations (admin) access is invite-only in production.
        </p>
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

        <form action={signUpAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Display name (optional)
            <input
              type="text"
              name="fullName"
              maxLength={200}
              placeholder="How we greet you in threads"
              className="input-field rounded-md px-3 py-2.5"
            />
          </label>
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
              minLength={8}
              required
              autoComplete="new-password"
              className="input-field rounded-md px-3 py-2.5"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-foreground">
            Account role
            <select
              name="role"
              defaultValue={defaultRole}
              className="input-field rounded-md px-3 py-2.5"
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
            className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-colors hover:opacity-[0.93] active:translate-y-px"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-sm text-muted">
          Already have an account?{" "}
          <Link href={authRoutes.signIn} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
