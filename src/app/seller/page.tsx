import Link from "next/link";
import { createListingAction } from "@/app/seller/actions";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { connectStripePayoutAction } from "@/app/seller/payout-actions";
import { QualificationSnapshotPanel } from "@/components/agreements/qualification-snapshot-panel";
import { AgreementThreadPanel } from "@/components/messaging/agreement-thread-panel";
import { DealTimeline } from "@/components/messaging/deal-timeline";
import { dealCheckpointLabel } from "@/lib/listings/deal-template";
import { ListingInquiryThreadPanel } from "@/components/messaging/listing-inquiry-thread-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ListingRow } from "@/components/listings/listing-row";
import { StatCard } from "@/components/ui/stat-card";
import { getMySellerAgreements } from "@/lib/agreements/queries";
import { requireRole } from "@/lib/auth/authorization";
import { authRoutes } from "@/lib/navigation";
import {
  extractQualificationSnapshot,
  getNonInternalAgreementEventsByAgreementIds,
} from "@/lib/events/queries";
import { getMyListings } from "@/lib/listings/queries";
import {
  getThreadsWithMessagesByAgreementIds,
  getThreadsWithMessagesByThreadIds,
} from "@/lib/messaging/queries";
import { getPaymentRollupsByAgreementIds } from "@/lib/payments/queries";
import { getMyPayoutAccount } from "@/lib/payouts/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SellerDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    message?: string;
  }>;
};

export default async function SellerDashboardPage({ searchParams }: SellerDashboardPageProps) {
  await requireRole(["seller", "admin"]);
  const [listings, sellerAgreements, payoutAccount] = await Promise.all([
    getMyListings(),
    getMySellerAgreements(),
    getMyPayoutAccount(),
  ]);
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const listingIdsMine = listings.map((l) => l.id);

  const { data: sellerInquiryThreadRows } =
    listingIdsMine.length > 0 ?
      await supabase
        .from("message_threads")
        .select("id, listing_id")
        .in("listing_id", listingIdsMine)
        .not("listing_id", "is", null)
    : { data: [] as { id: string; listing_id: string | null }[] };

  const inquiryThreadIds = [...new Set((sellerInquiryThreadRows ?? []).map((t) => t.id))];

  const agreementIds = sellerAgreements.map((a) => a.id);

  const [threadsByAgreement, inquiryBundles, eventsMap, paymentRollups] = await Promise.all([
    getThreadsWithMessagesByAgreementIds(agreementIds),
    getThreadsWithMessagesByThreadIds(inquiryThreadIds),
    getNonInternalAgreementEventsByAgreementIds(agreementIds),
    getPaymentRollupsByAgreementIds(agreementIds),
  ]);

  const listingTitleById = new Map(listings.map((l) => [l.id, l.title]));
  const activeCount = listings.filter((listing) => listing.status === "active").length;
  const pendingCount = listings.filter(
    (listing) => listing.status === "pending_review" || listing.status === "draft"
  ).length;
  const openApplications = sellerAgreements.filter((a) => a.status === "draft").length;

  return (
    <DashboardShell
      title="Seller Dashboard"
      subtitle="Manage listings, review buyer requests, and reduce payment risk."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Listings"
          value={String(activeCount)}
          description={`${pendingCount} listings pending verification before publishing.`}
        />
        <StatCard
          label="Open Buyer Requests"
          value={String(openApplications)}
          description="Draft swap applications awaiting your response or admin review."
        />
        <StatCard
          label="Active Swaps"
          value="--"
          description="Agreement activation metrics will populate from payment workflows."
        />
        <StatCard
          label="At-Risk Accounts"
          value="0"
          description="Compliance alerts will appear here once risk engine is active."
        />
      </section>

      {params.error ? (
        <p className="rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      {params.message === "inquiry-sent" ? (
        <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          Inquiry reply sent—the buyer sees it here and under Messages.
        </p>
      ) : null}
      {params.success ? (
        <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          {params.success === "message-sent"
            ? "Message sent."
            : params.success === "stripe-onboarding-complete"
              ? "Stripe onboarding returned successfully."
              : "Listing submitted for review."}
        </p>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-card p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#091c3d]/60 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gold">Stripe Connect</p>
            <p className="mt-1 text-sm text-slate-300">
              {payoutAccount?.onboarding_complete
                ? "Payout onboarding complete."
                : "Connect your payout account for escrow disbursements."}
            </p>
            {payoutAccount?.stripe_account_id ? (
              <p className="mt-1 text-xs text-slate-500">
                Account: {payoutAccount.stripe_account_id}
              </p>
            ) : null}
          </div>
          <form action={connectStripePayoutAction}>
            <button
              type="submit"
              className="rounded-md border border-gold/40 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
            >
              {payoutAccount?.onboarding_complete
                ? "Refresh payout status"
                : "Connect Stripe payouts"}
            </button>
          </form>
        </div>

        <h2 className="text-lg font-semibold text-white">Create Equipment Listing</h2>
        <p className="mt-2 text-sm text-slate-400">
          Tip: mirror how you&apos;d explain the deal to a buyer on the phone—monthly headline, deposit, payoff, term,
          condition. Ops reviews every submission before it goes public.
        </p>
        <form action={createListingAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="title" required placeholder="Listing title" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="category" required placeholder="Category (Excavator, Box Truck...)" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="make" placeholder="Make" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="model" placeholder="Model" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="modelYear" placeholder="Year" type="number" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="serialOrVin" required placeholder="Serial / VIN" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="locationCity" placeholder="City" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="locationState" placeholder="State" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="monthlyPayment" required placeholder="Monthly Payment (e.g. 1850)" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="deposit" defaultValue="0" placeholder="Deposit" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="buyoutPrice" placeholder="Buyout Price (optional)" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <input name="remainingTermMonths" type="number" placeholder="Remaining Term (months)" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold" />
          <p className="text-xs leading-relaxed text-slate-500 md:col-span-2">
            Monthly + deposit + term power the marketplace cards—buyers compare apples-to-apples before they message
            you.
          </p>
          <select name="conditionRating" className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold">
            <option value="">Condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="needs-work">Needs Work</option>
          </select>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Deal template</label>
            <select
              name="dealTemplate"
              required
              className="mt-1 w-full rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold md:max-w-md"
            >
              {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
                <option key={lane.deal} value={lane.deal}>
                  {lane.longLabel}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Pick the lane that matches your paperwork—buyers and ops use this for the document checklist and milestones.
            </p>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="collateralIsTitled"
                value="yes"
                className="mt-1 rounded border-white/30 bg-[#091c3d]"
              />
              <span>
                Collateral has a{' '}
                <span className="font-medium text-white">motor-vehicle-style title</span> (use VIN + title verification path)
              </span>
            </label>
          </div>
          <textarea name="description" required placeholder="Equipment details, condition, and terms..." className="min-h-28 rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold md:col-span-2" />
          <textarea
            name="assetUrls"
            placeholder="Optional media URLs (one per line)"
            className="min-h-24 rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-sm text-white outline-none focus:border-gold md:col-span-2"
          />
          <button type="submit" className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d] md:col-span-2 md:w-fit">
            Submit Listing
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pre-application inquiries</h2>
        {(sellerInquiryThreadRows ?? []).filter((t) => t.listing_id).length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            When shoppers message your listings before applying, conversations land here and in{" "}
            <Link href={authRoutes.messages} className="font-semibold text-gold hover:underline">
              Messages
            </Link>
            .
          </p>
        ) : (
          (sellerInquiryThreadRows ?? []).map((row) => {
            if (!row.listing_id) return null;
            const bundle = inquiryBundles.get(row.id);

            return (
              <article key={row.id} className="rounded-xl border border-white/10 bg-card p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">{listingTitleById.get(row.listing_id) ?? "Listing"}</p>
                  <Link
                    href={`/listings/${row.listing_id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-gold hover:underline"
                  >
                    View listing
                  </Link>
                </div>
                <ListingInquiryThreadPanel
                  listingId={row.listing_id}
                  threadId={row.id}
                  messages={bundle?.messages ?? []}
                  returnTo={`${authRoutes.messages}?inquiry=${encodeURIComponent(row.id)}`}
                  heading="Buyer message"
                  description="Reply before they submit an application. They still route serious offers through Apply for swap."
                />
              </article>
            );
          })
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Buyer applications</h2>
        {sellerAgreements.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No applications on your listings yet.
          </p>
        ) : (
          sellerAgreements.map((agreement) => {
            const bundle = threadsByAgreement.get(agreement.id);
            const evs = eventsMap.get(agreement.id) ?? [];
            const latest = evs.length > 0 ? evs.at(-1)?.message ?? null : null;
            const appEvent = evs.find((e) => e.event_type === "application_submitted");
            const qualification = extractQualificationSnapshot(appEvent?.metadata ?? null);
            const roll = paymentRollups.get(agreement.id);

            return (
              <article key={agreement.id} className="rounded-xl border border-white/10 bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-white">Buyer {agreement.buyer_id.slice(0, 8)}…</p>
                  <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase text-gold">
                    {agreement.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Listing {agreement.listing_id.slice(0, 8)}… · Monthly{" "}
                  {(agreement.monthly_payment_cents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })}
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
                {qualification ? (
                  <QualificationSnapshotPanel snapshot={qualification} title="Buyer pre-apply snapshot" />
                ) : null}
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
        <h2 className="text-lg font-semibold text-white">My Listings</h2>
        {listings.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No listings yet. Create your first listing above.
          </p>
        ) : (
          listings.map((listing) => <ListingRow key={listing.id} listing={listing} />)
        )}
      </section>
    </DashboardShell>
  );
}
