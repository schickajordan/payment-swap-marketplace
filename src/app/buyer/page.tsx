import Link from "next/link";
import { startInstallmentCheckoutAction } from "@/app/buyer/pay-actions";
import { QualificationSnapshotPanel } from "@/components/agreements/qualification-snapshot-panel";
import { AgreementThreadPanel } from "@/components/messaging/agreement-thread-panel";
import { DealTimeline } from "@/components/messaging/deal-timeline";
import { dealCheckpointLabel, dealTemplateLabel } from "@/lib/listings/deal-template";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { getMyBuyerAgreements } from "@/lib/agreements/queries";
import { requireRole } from "@/lib/auth/authorization";
import { authRoutes } from "@/lib/navigation";
import {
  extractQualificationSnapshot,
  getNonInternalAgreementEventsByAgreementIds,
} from "@/lib/events/queries";
import { getActiveListings } from "@/lib/listings/queries";
import { getThreadsWithMessagesByAgreementIds } from "@/lib/messaging/queries";
import {
  getMyUpcomingAgreementPayments,
  getPaymentRollupsByAgreementIds,
} from "@/lib/payments/queries";

type BuyerDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    payment?: string;
  }>;
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default async function BuyerDashboardPage({ searchParams }: BuyerDashboardPageProps) {
  await requireRole(["buyer", "seller", "admin"]);
  const params = await searchParams;
  const [listings, agreements, upcomingPayments] = await Promise.all([
    getActiveListings(24),
    getMyBuyerAgreements(),
    getMyUpcomingAgreementPayments(30),
  ]);
  const agreementIds = agreements.map((a) => a.id);
  const [threadsByAgreement, eventsMap, paymentRollups] = await Promise.all([
    getThreadsWithMessagesByAgreementIds(agreementIds),
    getNonInternalAgreementEventsByAgreementIds(agreementIds),
    getPaymentRollupsByAgreementIds(agreementIds),
  ]);
  const pendingApplications = agreements.filter((agreement) => agreement.status === "draft").length;
  const activeContracts = agreements.filter(
    (agreement) => agreement.status === "signed" || agreement.status === "active"
  ).length;
  const nextPaymentDueCents = upcomingPayments[0]?.amount_cents ?? 0;

  return (
    <DashboardShell
      title="Buyer Dashboard"
      subtitle="Track applications, agreements, payment schedules, and the listings you are actively chasing."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Live marketplace pool"
          value={String(listings.length)}
          description="Snapshot of active listings you can browse from this dashboard—open Marketplace for full filters."
        />
        <StatCard
          label="Pending Applications"
          value={String(pendingApplications)}
          description="Draft applications waiting for seller/admin progression."
        />
        <StatCard
          label="Contracts to Sign"
          value={String(activeContracts)}
          description="Signed or active agreements in your current pipeline."
        />
        <StatCard
          label="Next Payment Due"
          value={centsToUsd(nextPaymentDueCents)}
          description="Smallest upcoming scheduled charge across your agreements (deposit or installment)."
        />
      </section>

      {params.error ? (
        <p className="rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      {params.success ? (
        <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          {params.success === "message-sent"
            ? "Message sent."
            : params.success === "application-submitted"
              ? "Application submitted. The seller will be notified."
              : "Update completed."}
        </p>
      ) : null}
      {params.payment === "success" ? (
        <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          Payment submitted. Your deposit or installment should mark paid within a minute once Stripe confirms—we will
          also email receipts from Stripe when enabled.
        </p>
      ) : null}
      {params.payment === "cancelled" ? (
        <p className="rounded-md border border-amber-400/30 bg-amber-500/10 p-2 text-sm text-amber-100">
          Checkout cancelled. You can retry payment any time before the due date.
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Discover Equipment</h2>
        {listings.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No active listings yet. Check back soon.
          </p>
        ) : (
          listings.map((listing) => (
            <article key={listing.id} className="rounded-xl border border-white/10 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{listing.title}</h3>
                  <p className="text-sm text-slate-300">
                    {listing.category} {listing.make ? `- ${listing.make}` : ""}{" "}
                    {listing.model ?? ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {dealTemplateLabel(listing.deal_template)}
                    {listing.collateral_is_titled ? " · titled / VIN" : " · serial path"}
                  </p>
                </div>
                <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase tracking-wide text-gold">
                  {listing.status.replace("_", " ")}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-4">
                <p>Monthly: {centsToUsd(listing.monthly_payment_cents)}</p>
                <p>Deposit: {centsToUsd(listing.deposit_cents)}</p>
                <p>Term: {listing.remaining_term_months ?? "N/A"} months</p>
                <p>
                  Location: {listing.location_city ?? "N/A"}, {listing.location_state ?? "N/A"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/listings/${listing.id}`}
                  className="rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Listing details
                </Link>
                <Link
                  href={`/listings/${listing.id}`}
                  className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                >
                  Review &amp; apply
                </Link>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">My applications &amp; messages</h2>
        {agreements.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            You have no applications yet. Apply from the list above.
          </p>
        ) : (
          agreements.map((agreement) => {
            const bundle = threadsByAgreement.get(agreement.id);
            const evs = eventsMap.get(agreement.id) ?? [];
            const latest = evs.length > 0 ? evs.at(-1)?.message ?? null : null;
            const appEvent = evs.find((e) => e.event_type === "application_submitted");
            const qualification = extractQualificationSnapshot(appEvent?.metadata ?? null);
            const roll = paymentRollups.get(agreement.id);

            return (
              <article key={agreement.id} className="rounded-xl border border-white/10 bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">Agreement {agreement.id.slice(0, 8)}…</p>
                  <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase text-gold">
                    {agreement.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Monthly {centsToUsd(agreement.monthly_payment_cents)} · Escrow{" "}
                  {agreement.escrow_enabled ? "on" : "off"}
                </p>
                <div className="mt-4">
                  <DealTimeline
                    agreementStatus={agreement.status}
                    dealCheckpointLabel={dealCheckpointLabel(agreement.deal_checkpoint)}
                    paidInstallments={roll?.paid ?? 0}
                    scheduledInstallments={roll?.scheduledOrOpen ?? 0}
                    latestEventLabel={latest}
                  />
                </div>
                {qualification ? <QualificationSnapshotPanel snapshot={qualification} /> : null}
                <AgreementThreadPanel
                  key={`${agreement.id}-${bundle?.thread.id ?? "pending"}`}
                  agreementId={agreement.id}
                  threadId={bundle?.thread.id ?? null}
                  messages={bundle?.messages ?? []}
                  returnTo={`${authRoutes.messages}?agreement=${encodeURIComponent(agreement.id)}`}
                />
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Payment schedule</h2>
        {upcomingPayments.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No upcoming scheduled payments yet. Schedules appear when agreements are approved.
          </p>
        ) : (
          <div className="space-y-2 rounded-xl border border-white/10 bg-card p-4">
            <div className="hidden grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 text-sm md:grid">
              <p className="font-semibold text-white">Due Date</p>
              <p className="font-semibold text-white">Kind</p>
              <p className="font-semibold text-white">Amount</p>
              <p className="font-semibold text-white">Status</p>
              <p className="font-semibold text-white">Agreement</p>
              <p className="font-semibold text-white">Pay</p>
            </div>
            {upcomingPayments.slice(0, 12).map((payment) => (
              <div
                key={payment.id}
                className="grid gap-2 rounded-md border border-white/5 bg-[#091c3d]/60 p-2 text-sm text-slate-300 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0"
              >
                <p>{payment.due_date}</p>
                <p className="capitalize">{payment.purpose}</p>
                <p>{centsToUsd(payment.amount_cents)}</p>
                <p className="uppercase tracking-wide text-gold">{payment.status}</p>
                <p className="text-slate-400">{payment.agreement_id.slice(0, 8)}…</p>
                <div className="md:flex md:justify-end">
                  {payment.status === "processing" ? (
                    <span className="text-xs text-slate-400">Processing…</span>
                  ) : (
                    <form action={startInstallmentCheckoutAction}>
                      <input type="hidden" name="agreementPaymentId" value={payment.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-[#071733] hover:bg-[#ffd14d]"
                      >
                        {payment.status === "failed" ? "Retry payment" : "Pay now"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
