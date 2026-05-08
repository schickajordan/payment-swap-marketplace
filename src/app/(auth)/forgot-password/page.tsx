import Link from "next/link";
import { ForgotPasswordEmailForm } from "@/components/auth/forgot-password-email-form";
import { AuthBrandHeader } from "@/components/layout/auth-brand-header";
import { HostingConfigBanner } from "@/components/layout/hosting-config-banner";
import { authRoutes } from "@/lib/navigation";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const sp = await searchParams;

  return (
    <>
      <HostingConfigBanner />
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
        <AuthBrandHeader />
        <div className="panel-elevated rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-[1.75rem]">
            Reset password
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            We email a secure reset link from our account system. If you are developing locally and outbound mail is
            disabled, use your environment&apos;s auth mail capture or test inbox.
          </p>

          {sp.success === "sent" ?
            <p className="mt-4 rounded-md border-l-4 border-emerald-700 bg-[var(--card-muted)] p-3 text-sm font-medium text-foreground">
              If this address is registered, you&apos;ll get reset instructions shortly—check spam. The link expires
              quickly.
            </p>
          : null}

          <div className="mt-6">
            <ForgotPasswordEmailForm />
          </div>

          <p className="mt-4 text-sm text-muted">
            Need an account?{" "}
            <Link href={authRoutes.signUp} className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </div>
    </main>
    </>
  );
}
