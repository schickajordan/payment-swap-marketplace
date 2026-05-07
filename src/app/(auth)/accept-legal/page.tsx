import Link from "next/link";
import { acceptLegalAction } from "@/app/(auth)/actions";
import { authRoutes } from "@/lib/navigation";

type AcceptLegalPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function AcceptLegalPage({ searchParams }: AcceptLegalPageProps) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : authRoutes.account;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="panel-elevated rounded-2xl p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
          Review legal agreements
        </h1>
        <p className="mt-2 text-sm text-muted">
          To continue using protected account features, confirm current legal documents.
        </p>
        {params.error && params.error !== "consent-required" ? (
          <p className="mt-4 rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
            {params.error}
          </p>
        ) : null}
        {params.error === "consent-required" ? (
          <p className="mt-4 rounded-md border border-[var(--danger-border)] bg-[var(--danger-bg)] p-3 text-sm text-[var(--danger-text)]">
            Accept both documents to continue.
          </p>
        ) : null}
        <form action={acceptLegalAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" name="termsAccepted" className="mt-1" />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="font-semibold text-[var(--link)] underline">
                Terms of Service
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-foreground">
            <input type="checkbox" name="privacyAccepted" className="mt-1" />
            <span>
              I agree to the{" "}
              <Link href="/privacy" className="font-semibold text-[var(--link)] underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          <button
            type="submit"
            className="rounded-md bg-[var(--button-primary-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--button-primary-fg)] transition-colors hover:opacity-[0.93]"
          >
            Accept and continue
          </button>
        </form>
      </div>
    </main>
  );
}
