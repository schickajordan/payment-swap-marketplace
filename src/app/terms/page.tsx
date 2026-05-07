import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, CURRENT_TERMS_VERSION } from "@/lib/legal/constants";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">
        Version {CURRENT_TERMS_VERSION} · Effective {LEGAL_EFFECTIVE_DATE}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          Payment Swap Marketplace is a business-to-business platform for equipment listings, messaging, and payment
          workflow coordination. We are not a bank, lender, broker-dealer, insurer, title office, or legal advisor.
        </p>
        <p>
          You are responsible for ensuring your authority to transact, validating collateral status, and using
          attorneys or lenders where required by your deal.
        </p>
        <p>
          By using this service, you agree to business-use restrictions, accurate account information, and platform
          policies related to listings, payments, and dispute handling.
        </p>
      </div>
      <p className="mt-8 text-sm text-muted">
        Also review our{" "}
        <Link href="/privacy" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}
