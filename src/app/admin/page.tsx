import {
  approveAgreementAction,
  postAdminInternalNoteAction,
  rejectAgreementAction,
  setAgreementContractAction,
  setDealCheckpointAction,
} from "@/app/admin/actions";
import { QualificationSnapshotPanel } from "@/components/agreements/qualification-snapshot-panel";
import { PendingListingsSection } from "@/components/admin/pending-listings-section";
import { AgreementThreadPanel } from "@/components/messaging/agreement-thread-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/ui/stat-card";
import { getRecentLiquidityMilestones } from "@/lib/analytics/liquidity-milestones";
import { getAdminAgreementQueue } from "@/lib/agreements/queries";
import { requireRole } from "@/lib/auth/authorization";
import {
  extractQualificationSnapshot,
  getAdminAgreementEvents,
  getNonInternalAgreementEventsByAgreementIds,
} from "@/lib/events/queries";
import { getThreadsWithMessagesByAgreementIds } from "@/lib/messaging/queries";
import {
  DEAL_CHECKPOINTS,
  dealCheckpointLabel,
  dealTemplateLabel,
} from "@/lib/listings/deal-template";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AdminDashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    listingSearch?: string;
  }>;
};

function centsToUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function adminSuccessMessage(success: string) {
  const map: Record<string, string> = {
    "listing-approved": "Listing published to the marketplace.",
    "listing-rejected": "Listing flagged/rejected.",
    "internal-note-saved": "Internal note saved (visible to admins only).",
    "message-sent": "Message sent.",
    "agreement-approved": "Agreement approved; payment schedule generated.",
    "agreement-rejected": "Agreement cancelled/rejected.",
    "deal-checkpoint-updated": "Deal operational checkpoint saved.",
    "contract-metadata-updated": "Contract metadata saved.",
  };
  return map[success] ?? "Changes saved.";
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  await requireRole(["admin"]);
  const params = await searchParams;
  const listingSearch = typeof params.listingSearch === "string" ? params.listingSearch : undefined;
  const supabase = await createServerSupabaseClient();
  const [queue, events, milestones] = await Promise.all([
    getAdminAgreementQueue(),
    getAdminAgreementEvents(25),
    getRecentLiquidityMilestones(supabase, 25),
  ]);
  const agreementIds = queue.map((q) => q.id);
  const [threadsByAgreement, agreementEventsMap] = await Promise.all([
    getThreadsWithMessagesByAgreementIds(agreementIds),
    getNonInternalAgreementEventsByAgreementIds(agreementIds),
  ]);
  const draftCount = queue.filter((item) => item.status === "draft").length;
  const signedCount = queue.filter((item) => item.status === "signed").length;
  const activeCount = queue.filter((item) => item.status === "active").length;
  const defaultedCount = queue.filter((item) => item.status === "defaulted").length;

  return (
    <DashboardShell
      title="Admin Dashboard"
      subtitle="Filter the listing queue, preview drafts like a buyer would, approve agreements, and watch liquidity events in one surface."
    >
      <section className="rounded-xl border border-amber-400/35 bg-amber-950/40 p-4 text-sm text-amber-50 md:p-5">
        <h2 className="font-semibold text-amber-100">Administrator access</h2>
        <p className="mt-2 leading-relaxed text-amber-100/90">
          This app reads roles from the <strong>profiles</strong> table (<code className="rounded bg-black/35 px-1.5 py-px text-xs">profiles.role</code>
          ). Public sign-up does not create admins. In Supabase, open <strong>Table Editor → profiles</strong>, find the
          user&apos;s row (same <code className="rounded bg-black/35 px-1.5 py-px text-xs">id</code> as <strong>Authentication → Users</strong>
          ), and set <code className="rounded bg-black/35 px-1.5 py-px text-xs">role</code> to{" "}
          <code className="rounded bg-black/35 px-1.5 py-px text-xs">admin</code>. Refresh this page—it applies on the next
          request.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Draft Applications"
          value={String(draftCount)}
          description="New buyer applications awaiting compliance review."
        />
        <StatCard
          label="Signed Agreements"
          value={String(signedCount)}
          description="Approved contracts waiting activation/handoff events."
        />
        <StatCard
          label="Active Agreements"
          value={String(activeCount)}
          description="Live swap contracts currently in repayment windows."
        />
        <StatCard
          label="Defaulted Agreements"
          value={String(defaultedCount)}
          description="High-priority recovery and dispute escalation queue."
        />
      </section>

      {params.error ? (
        <p className="rounded-md border border-red-300/40 bg-red-500/10 p-2 text-sm text-red-200">
          {params.error}
        </p>
      ) : null}
      {params.success ? (
        <p className="rounded-md border border-emerald-300/40 bg-emerald-500/10 p-2 text-sm text-emerald-200">
          {adminSuccessMessage(params.success)}
        </p>
      ) : null}

      <PendingListingsSection listingSearch={listingSearch} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Agreement Review Queue</h2>
        {queue.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No agreements in queue yet.
          </p>
        ) : (
          queue.map((agreement) => {
            const bundle = threadsByAgreement.get(agreement.id);
            const appEvent = (agreementEventsMap.get(agreement.id) ?? []).find(
              (e) => e.event_type === "application_submitted"
            );
            const qualification = extractQualificationSnapshot(appEvent?.metadata ?? null);
            return (
            <article key={agreement.id} className="rounded-xl border border-white/10 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {agreement.listings?.title ?? "Untitled Listing"}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {agreement.listings?.category ?? "Unknown category"} - Buyer{" "}
                    {agreement.buyer_id.slice(0, 8)}... / Seller{" "}
                    {agreement.seller_id.slice(0, 8)}...
                  </p>
                </div>
                <span className="rounded-full border border-gold/40 px-2 py-1 text-xs uppercase tracking-wide text-gold">
                  {agreement.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-4">
                <p>Monthly: {centsToUsd(agreement.monthly_payment_cents)}</p>
                <p>Escrow: {agreement.escrow_enabled ? "Enabled" : "Disabled"}</p>
                <p>Contract: {agreement.contract_status}</p>
                <p>
                  Location: {agreement.listings?.location_city ?? "N/A"},{" "}
                  {agreement.listings?.location_state ?? "N/A"}
                </p>
                <p>Created: {new Date(agreement.created_at).toLocaleDateString()}</p>
              </div>

              {agreement.listings ?
                <p className="mt-2 text-xs text-slate-500">
                  Listing lane:{" "}
                  <span className="font-medium text-slate-300">
                    {dealTemplateLabel(agreement.listings.deal_template)}
                  </span>
                  {agreement.listings.collateral_is_titled ?
                    <span className="text-slate-500"> · titled / VIN path</span>
                  : <span className="text-slate-500"> · serial / UCC path</span>}
                </p>
              : null}

              <div className="mt-4 rounded-lg border border-white/10 bg-[#091c3d]/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Contract governance
                </p>
                <form action={setAgreementContractAction} className="mt-3 grid gap-2 md:grid-cols-3">
                  <input type="hidden" name="agreementId" value={agreement.id} />
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    Contract version
                    <input
                      name="contractVersion"
                      defaultValue={agreement.contract_version ?? "v1"}
                      className="rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-sm text-white outline-none focus:border-gold"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    Contract status
                    <select
                      name="contractStatus"
                      defaultValue={agreement.contract_status}
                      className="rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-sm text-white outline-none focus:border-gold"
                    >
                      <option value="draft">draft</option>
                      <option value="uploaded">uploaded</option>
                      <option value="executed">executed</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-400 md:col-span-3">
                    Signed contract URL
                    <input
                      name="signedContractUrl"
                      defaultValue={agreement.signed_contract_url ?? ""}
                      placeholder="https://..."
                      className="rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-sm text-white outline-none focus:border-gold"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-1 w-fit rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
                  >
                    Save contract fields
                  </button>
                </form>
              </div>

              {qualification ? (
                <QualificationSnapshotPanel
                  snapshot={qualification}
                  title="Buyer pre-apply snapshot"
                  className="mt-3 rounded-md border border-white/10 bg-[#081c3b]/55 p-3"
                />
              ) : null}

              <div className="mt-4 rounded-lg border border-white/10 bg-[#091c3d]/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Operational checkpoint
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Current:{" "}
                  <span className="font-semibold text-gold">
                    {dealCheckpointLabel(agreement.deal_checkpoint)}
                  </span>
                </p>
                <form action={setDealCheckpointAction} className="mt-3 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="agreementId" value={agreement.id} />
                  <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-xs text-slate-400">
                    Set checkpoint
                    <select
                      name="dealCheckpoint"
                      defaultValue={agreement.deal_checkpoint}
                      className="rounded-md border border-white/20 bg-[#091c3d] px-2 py-2 text-sm text-white outline-none focus:border-gold"
                    >
                      {DEAL_CHECKPOINTS.map((cp) => (
                        <option key={cp} value={cp}>
                          {dealCheckpointLabel(cp)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="rounded-md border border-gold/50 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/10"
                  >
                    Save checkpoint
                  </button>
                </form>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {agreement.status === "draft" ? (
                  <>
                    <form action={approveAgreementAction}>
                      <input type="hidden" name="agreementId" value={agreement.id} />
                      <button
                        type="submit"
                        className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={rejectAgreementAction}>
                      <input type="hidden" name="agreementId" value={agreement.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-red-300/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                      >
                        Reject
                      </button>
                    </form>
                  </>
                ) : null}
              </div>

              <AgreementThreadPanel
                key={`${agreement.id}-${bundle?.thread.id ?? "pending"}`}
                agreementId={agreement.id}
                threadId={bundle?.thread.id ?? null}
                messages={bundle?.messages ?? []}
                returnTo="/admin"
              />

              <form action={postAdminInternalNoteAction} className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Admin internal note
                </p>
                <input type="hidden" name="agreementId" value={agreement.id} />
                <textarea
                  name="note"
                  required
                  rows={2}
                  placeholder="Not visible to buyer or seller…"
                  className="w-full rounded-md border border-white/20 bg-[#091c3d] px-2 py-1.5 text-sm text-white outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10"
                >
                  Save internal note
                </button>
              </form>
            </article>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Liquidity milestones (north-star feed)</h2>
        <p className="text-xs text-slate-400">
          Cells are <span className="text-slate-300">STATE|category_slug</span> from live listings. Duplicate admin
          actions are idempotent via dedupe keys.
        </p>
        {milestones.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No recorded milestones yet—publish a listing, approve an agreement, collect a deposit, or pay a first
            installment.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-card">
            <table className="w-full min-w-[640px] text-left text-sm text-slate-300">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Cell</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Refs</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0">
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-slate-400">
                      {new Date(m.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-gold">{m.liquidity_cell}</td>
                    <td className="px-4 py-2 text-xs">{m.event_type}</td>
                    <td className="px-4 py-2 font-mono text-[11px] text-slate-500">
                      {m.listing_id ? `L ${m.listing_id.slice(0, 8)}…` : "—"}{" "}
                      {m.agreement_id ? `· A ${m.agreement_id.slice(0, 8)}…` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Operational Activity Feed</h2>
        {events.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-card p-4 text-sm text-slate-300">
            No activity events yet.
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <article
                key={event.id}
                className="rounded-lg border border-white/10 bg-card px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{event.message}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs uppercase tracking-wide text-gold">{event.event_type}</p>
                  {event.is_internal ? (
                    <span className="rounded border border-amber-400/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-200">
                      Internal
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
