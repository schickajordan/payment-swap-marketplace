import Link from "next/link";
import { redirect } from "next/navigation";
import { QualificationSnapshotPanel } from "@/components/agreements/qualification-snapshot-panel";
import { ContractDocumentsPanel } from "@/components/messaging/contract-documents-panel";
import { AgreementThreadPanel } from "@/components/messaging/agreement-thread-panel";
import { DealTimeline } from "@/components/messaging/deal-timeline";
import { ListingInquiryThreadPanel } from "@/components/messaging/listing-inquiry-thread-panel";
import { MarketingShell } from "@/components/layout/marketing-shell";
import {
  getAgreementMessagingShellIfViewer,
  getListingInquiryMessagingShellIfViewer,
  getUnifiedMessageInbox,
} from "@/lib/messaging/queries";
import { dealCheckpointLabel } from "@/lib/listings/deal-template";
import {
  extractQualificationSnapshot,
  type QualificationSnapshot,
  getParticipantAgreementEvents,
} from "@/lib/events/queries";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";
import { listContractArtifactsForAgreement } from "@/lib/agreements/contract-artifacts";
import { getPaymentRollupsByAgreementIds } from "@/lib/payments/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Messages",
  description: "Unified inbox for deal threads and pre-application listing inquiries.",
};

type MessagesPageProps = {
  searchParams: Promise<{
    agreement?: string;
    inquiry?: string;
    error?: string;
    success?: string;
    message?: string;
  }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(signInUrlWithNext(authRoutes.messages));
  }

  const sp = await searchParams;
  const agreementParam = (sp.agreement ?? "").trim();
  const inquiryParam = (sp.inquiry ?? "").trim();

  const [items, agreementShell, inquiryShell] = await Promise.all([
    getUnifiedMessageInbox(),
    agreementParam ? getAgreementMessagingShellIfViewer(agreementParam) : Promise.resolve(null),
    inquiryParam && !agreementParam ?
      getListingInquiryMessagingShellIfViewer(inquiryParam)
    : Promise.resolve(null),
  ]);

  let agreementExtras: {
    paidInstallments: number;
    scheduledInstallments: number;
    latestEventLabel: string | null;
    qualificationSnapshot: QualificationSnapshot | null;
  } | null = null;

  let agreementTimelineEvents: Awaited<ReturnType<typeof getParticipantAgreementEvents>> = [];
  let agreementVaultArtifacts: Awaited<ReturnType<typeof listContractArtifactsForAgreement>> = [];

  if (agreementShell) {
    try {
      const [rollups, evs, arts] = await Promise.all([
        getPaymentRollupsByAgreementIds([agreementShell.agreementId]),
        getParticipantAgreementEvents(agreementShell.agreementId, 80),
        listContractArtifactsForAgreement(supabase, agreementShell.agreementId),
      ]);
      agreementTimelineEvents = evs;
      agreementVaultArtifacts = arts;
      const roll = rollups.get(agreementShell.agreementId);
      const latest = evs.length > 0 ? evs.at(-1)?.message ?? null : null;
      const appEvent = evs.find((e) => e.event_type === "application_submitted");
      agreementExtras = {
        paidInstallments: roll?.paid ?? 0,
        scheduledInstallments: roll?.scheduledOrOpen ?? 0,
        latestEventLabel: latest,
        qualificationSnapshot: extractQualificationSnapshot(appEvent?.metadata ?? null),
      };
    } catch {
      agreementExtras = {
        paidInstallments: 0,
        scheduledInstallments: 0,
        latestEventLabel: null,
        qualificationSnapshot: null,
      };
      agreementVaultArtifacts = [];
    }
  }

  const selectedAgreementId = agreementShell?.agreementId;
  const selectedInquiryThreadId = inquiryShell?.threadId;

  const invalidAgreementDeepLink = Boolean(agreementParam) && !agreementShell;
  const invalidInquiryDeepLink = Boolean(inquiryParam) && !agreementParam && !inquiryShell;

  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 md:px-8 md:py-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Unified inbox</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Messages</h1>
          <p className="text-sm text-slate-400">
            Open a deal or pre-application inquiry; reply here without juggling buyer vs seller dashboards.
          </p>
        </header>

        {sp.error ?
          <p className="mt-6 rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {sp.error}
          </p>
        : null}
        {sp.success === "message-sent" ?
          <p className="mt-6 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
            Deal message sent.
          </p>
        : null}
        {sp.success === "dispute-logged" ?
          <p className="mt-6 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
            Your dispute summary was logged on the agreement timeline—counterparties see it on this same deal record.
          </p>
        : null}
        {sp.message === "inquiry-sent" ?
          <p className="mt-6 rounded-md border border-emerald-400/35 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
            Inquiry message sent—the other party sees it here and on the listing detail page.
          </p>
        : null}

        {invalidAgreementDeepLink ?
          <p className="mt-6 rounded-md border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            That agreement conversation is unavailable or you do not have access. Pick another thread from the list.
          </p>
        : null}
        {invalidInquiryDeepLink ?
          <p className="mt-6 rounded-md border border-amber-400/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            That listing inquiry does not exist or you do not have access.
          </p>
        : null}

        <section
          aria-label="Conversations"
          id="conversation"
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-start"
        >
          <nav aria-label="Thread list">
            <ul className="space-y-3">
              {items.length === 0 ?
                <li className="rounded-xl border border-white/10 bg-card p-8 text-center text-sm text-slate-400">
                  Nothing here yet. Browse the{" "}
                  <Link href="/marketplace" className="text-gold hover:text-[#ffd14d]">
                    marketplace
                  </Link>
                  , message a seller, or apply to open a deal thread.
                </li>
              : items.map((row) => {
                  const selected =
                    (row.kind === "agreement"
                      && selectedAgreementId
                      && row.agreementId === selectedAgreementId)
                    || (row.kind === "listing_inquiry"
                      && selectedInquiryThreadId
                      && row.threadId === selectedInquiryThreadId);

                  return (
                    <li
                      key={`${row.kind}-${row.threadId || row.agreementId || row.listingId}`}
                      className={`overflow-hidden rounded-xl border bg-card transition hover:border-gold/40 hover:bg-[#091c3d]/60 ${
                        selected ? "border-gold/55 ring-1 ring-gold/30" : "border-white/10"
                      }`}
                    >
                      <Link href={row.href} className="block p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-lg font-semibold text-white">{row.title}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              row.kind === "listing_inquiry" ? "border border-gold/40 text-gold"
                              : "border border-white/20 text-slate-300"
                            }`}
                          >
                            {row.kind === "listing_inquiry" ? "Inquiry" : "Deal"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{row.subtitle}</p>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-300">{row.lastPreview}</p>
                        {row.lastActivity ?
                          <p className="mt-2 text-[10px] text-slate-500">
                            Updated {new Date(row.lastActivity).toLocaleString()}
                          </p>
                        : null}
                      </Link>
                      {row.kind === "listing_inquiry" && row.listingId ?
                        <div className="border-t border-white/10 px-4 py-2 text-[11px] text-slate-500">
                          <Link
                            href={`/listings/${row.listingId}`}
                            className="font-semibold text-gold/90 hover:text-gold hover:underline"
                          >
                            Listing page →
                          </Link>
                        </div>
                      : null}
                    </li>
                  );
                })
              }
            </ul>

            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <Link
                href="/buyer"
                className="rounded-md border border-white/20 px-4 py-2 text-white hover:bg-white/10"
              >
                Buyer cockpit
              </Link>
              <Link
                href="/seller"
                className="rounded-md border border-white/20 px-4 py-2 text-white hover:bg-white/10"
              >
                Seller cockpit
              </Link>
            </div>
          </nav>

          <aside className="min-w-0 lg:sticky lg:top-28">
            {agreementShell ?
              <>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Selected · Deal thread</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Messages stay linked to your payment agreement. First send creates the thread row if needed.
                </p>
                {agreementExtras ?
                  <div className="mt-4">
                    <DealTimeline
                      agreementStatus={agreementShell.status}
                      dealCheckpointLabel={dealCheckpointLabel(agreementShell.deal_checkpoint)}
                      paidInstallments={agreementExtras.paidInstallments}
                      scheduledInstallments={agreementExtras.scheduledInstallments}
                      latestEventLabel={agreementExtras.latestEventLabel}
                    />
                    {agreementExtras.qualificationSnapshot ? (
                      <QualificationSnapshotPanel snapshot={agreementExtras.qualificationSnapshot} />
                    ) : null}
                  </div>
                : null}
                <ContractDocumentsPanel
                  agreementId={agreementShell.agreementId}
                  signedContractUrl={agreementShell.signed_contract_url}
                  contractStatus={agreementShell.contract_status}
                  contractUploadedAt={agreementShell.contract_uploaded_at}
                  contractExecutedAt={agreementShell.contract_executed_at}
                  vaultArtifacts={agreementVaultArtifacts}
                  events={agreementTimelineEvents}
                />
                <AgreementThreadPanel
                  agreementId={agreementShell.agreementId}
                  threadId={agreementShell.threadId}
                  messages={agreementShell.messages}
                  returnTo={`${authRoutes.messages}?agreement=${encodeURIComponent(agreementShell.agreementId)}`}
                />
              </>
            : inquiryShell ?
              <>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Selected · Listing inquiry</h2>
                <p className="mt-1 text-sm text-slate-400">
                  <Link
                    href={`/listings/${inquiryShell.listingId}`}
                    className="text-gold hover:text-[#ffd14d] hover:underline"
                  >
                    Go to listing detail
                  </Link>
                  {" · "}
                  Apply for swap when you are ready to formalize terms.
                </p>
                <ListingInquiryThreadPanel
                  listingId={inquiryShell.listingId}
                  threadId={inquiryShell.threadId}
                  messages={inquiryShell.messages}
                  returnTo={`${authRoutes.messages}?inquiry=${encodeURIComponent(inquiryShell.threadId)}`}
                  heading={inquiryShell.viewer === "seller" ? "Buyer message" : "Ask before you apply"}
                  description={
                    inquiryShell.viewer === "seller" ?
                      "Reply before they submit an application. Serious buyers still route through Apply for swap."
                    : undefined
                  }
                />
              </>
            : (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#091c3d]/30 p-8 text-center text-sm text-slate-400 lg:py-14">
                Select a conversation on the left to read and reply, or paste a deeplink shared from email or Slack.
              </div>
            )}
          </aside>
        </section>
      </main>
    </MarketingShell>
  );
}
