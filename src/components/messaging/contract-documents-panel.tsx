import { logContractOpenAction, submitDisputeNoteAction } from "@/app/messaging/deal-desk-actions";
import type { Database } from "@/lib/supabase/database.types";
import { authRoutes } from "@/lib/navigation";

type AgreementEventRow = Database["public"]["Tables"]["agreement_events"]["Row"];
type ArtifactRow = Database["public"]["Tables"]["agreement_contract_artifacts"]["Row"];

type ContractDocumentsPanelProps = {
  agreementId: string;
  signedContractUrl: string | null;
  contractStatus: string;
  contractUploadedAt: string | null;
  contractExecutedAt: string | null;
  vaultArtifacts: ArtifactRow[];
  events: AgreementEventRow[];
};

function formatEventType(t: string): string {
  switch (t) {
    case "contract_link_opened":
      return "Contract access";
    case "contract_artifact_uploaded":
      return "Vault upload";
    case "dispute_escalation":
      return "Dispute / issue note";
    default:
      return t.replace(/_/g, " ");
  }
}

export function ContractDocumentsPanel({
  agreementId,
  signedContractUrl,
  contractStatus,
  contractUploadedAt,
  contractExecutedAt,
  vaultArtifacts,
  events,
}: ContractDocumentsPanelProps) {
  const highlight = new Set([
    "contract_link_opened",
    "contract_artifact_uploaded",
    "dispute_escalation",
    "stripe_payment_succeeded",
    "stripe_payment_failed",
    "stripe_amount_mismatch",
    "stripe_payment_processing",
  ]);
  const deskEvents = events.filter((e) => highlight.has(e.event_type));
  const hasVault = vaultArtifacts.length > 0;
  const hasExternal = Boolean(signedContractUrl?.trim());
  const [, ...olderVaultArtifacts] = vaultArtifacts;

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-[#091c3d]/45 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Deal desk</p>
        <p className="mt-1 text-xs text-slate-500">
          Private vault files use short-lived signed links; opens are logged on the timeline. External URLs (manual ops
          links) stay supported alongside the vault.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded border border-white/10 bg-black/25 px-2 py-1">
          File status: <span className="font-semibold text-slate-200">{contractStatus}</span>
        </span>
        {hasVault ?
          <span className="rounded border border-white/10 bg-black/25 px-2 py-1">
            Vault: <span className="font-semibold text-slate-200">{vaultArtifacts.length}</span> revision
            {vaultArtifacts.length === 1 ? "" : "s"}
          </span>
        : null}
        {contractExecutedAt ?
          <span className="rounded border border-white/10 bg-black/25 px-2 py-1">
            Executed {new Date(contractExecutedAt).toLocaleDateString()}
          </span>
        : null}
        {!contractExecutedAt && contractUploadedAt ?
          <span className="rounded border border-white/10 bg-black/25 px-2 py-1">
            Uploaded {new Date(contractUploadedAt).toLocaleDateString()}
          </span>
        : null}
      </div>

      {hasVault ?
        <div className="space-y-3">
          <form action={logContractOpenAction} className="flex flex-col gap-2">
            <input type="hidden" name="agreementId" value={agreementId} />
            <input type="hidden" name="sourceKind" value="auto" />
            <button
              type="submit"
              className="w-fit rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] transition-colors hover:bg-[#ffd14d]"
            >
              Open latest vault document (access logged)
            </button>
            <p className="text-[11px] text-slate-500">
              Prefer this for audited lineage—expires in a few minutes after it is issued.
            </p>
          </form>

          {olderVaultArtifacts.length > 0 ?
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Earlier revisions</p>
              <ul className="mt-2 space-y-2 text-xs">
                {olderVaultArtifacts.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-white/5 bg-black/20 px-2 py-2 text-slate-300"
                  >
                    <span>
                      <span className="font-medium text-slate-200">{row.original_filename}</span>
                      {row.label ?
                        <span className="text-slate-500"> — {row.label}</span>
                      : null}
                      <span className="block text-[10px] text-slate-500">
                        {new Date(row.created_at).toLocaleString()}
                      </span>
                    </span>
                    <form action={logContractOpenAction}>
                      <input type="hidden" name="agreementId" value={agreementId} />
                      <input type="hidden" name="artifactId" value={row.id} />
                      <button
                        type="submit"
                        className="rounded border border-gold/40 px-2 py-1 text-[11px] font-semibold text-gold hover:bg-gold/10"
                      >
                        Open
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          : null}
        </div>
      : null}

      {hasExternal ?
        <div className={hasVault ? "border-t border-white/10 pt-4" : ""}>
          {hasVault ?
            <p className="mb-2 text-xs text-slate-500">
              Alternate: open the manually configured external link (DocuSign, lender portal, etc.).
            </p>
          : null}
          <form action={logContractOpenAction} className="flex flex-col gap-2">
            <input type="hidden" name="agreementId" value={agreementId} />
            <input type="hidden" name="sourceKind" value="external" />
            <button
              type="submit"
              className={`w-fit rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                hasVault ?
                  "border border-white/25 text-slate-200 hover:bg-white/10"
                : "bg-gold text-[#071733] hover:bg-[#ffd14d]"
              }`}
            >
              {hasVault ? "Open external contract link (logged)" : "Open executed contract (access logged)"}
            </button>
            {!hasVault ?
              <p className="text-[11px] text-slate-500">
                Use this button so your view is recorded on the audit trail.
              </p>
            : null}
          </form>
        </div>
      : null}

      {!hasVault && !hasExternal ?
        <p className="text-sm text-slate-500">
          No contract in the vault yet and no external link on file—ask operations to upload on the agreement or attach
          a URL in Admin.
        </p>
      : null}

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Payment or paperwork dispute</p>
        <p className="mt-1 text-xs text-slate-500">
          Summarize wrong amounts, ACH timing, or lien paperwork—this posts to both parties&apos; timelines (not a legal
          filing; it routes through your existing deal record).
        </p>
        <form action={submitDisputeNoteAction} className="mt-2 flex flex-col gap-2">
          <input type="hidden" name="agreementId" value={agreementId} />
          <textarea
            name="body"
            required
            minLength={8}
            rows={3}
            placeholder="e.g., Installment posted twice on the 12th; need Stripe payout trace and lender letter."
            className="rounded-md border border-white/20 bg-[#071733] px-3 py-2 text-sm text-white outline-none focus:border-gold"
          />
          <button
            type="submit"
            className="w-fit rounded-md border border-gold/40 bg-transparent px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/10"
          >
            Log dispute summary
          </button>
        </form>
      </div>

      <div className="border-t border-white/10 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recent access & dispute log</p>
        {deskEvents.length === 0 ?
          <p className="mt-2 text-xs text-slate-500">No contract opens or dispute notes yet.</p>
        : <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-xs">
            {deskEvents.map((e) => (
              <li key={e.id} className="rounded border border-white/5 bg-black/20 px-2 py-1.5 text-slate-300">
                <span className="font-semibold text-slate-200">{formatEventType(e.event_type)}</span>
                <span className="text-slate-500"> · {new Date(e.created_at).toLocaleString()}</span>
                <p className="mt-0.5 text-slate-400">{e.message}</p>
              </li>
            ))}
          </ul>
        }
        <p className="mt-2 text-[10px] text-slate-600">
          Full payment automation still depends on your Stripe Connect configuration—see{" "}
          <a href={`${authRoutes.account}`} className="text-gold hover:underline">
            Account hub
          </a>{" "}
          and published fees.
        </p>
      </div>
    </div>
  );
}
