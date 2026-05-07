import Link from "next/link";
import { CURRENT_PRIVACY_VERSION, LEGAL_EFFECTIVE_DATE } from "@/lib/legal/constants";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">
        Version {CURRENT_PRIVACY_VERSION} · Effective {LEGAL_EFFECTIVE_DATE}
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground">
        <p>
          We collect business account data, listing content, message metadata, and transaction records needed to run
          marketplace workflows and support compliance obligations.
        </p>
        <p>
          Contract artifacts and legal acceptance logs are stored as private records and are shared only with
          authorized parties, platform operations, or as required by law.
        </p>
        <p>
          You can request account-data review through support channels. Some records may be retained for fraud,
          accounting, or legal-defense obligations.
        </p>
      </div>
      <p className="mt-8 text-sm text-muted">
        Also review our{" "}
        <Link href="/terms" className="font-semibold text-[var(--link)] underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </main>
  );
}
