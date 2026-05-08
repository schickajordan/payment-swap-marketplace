import { logContractOpenAction, submitDisputeNoteAction } from "@/app/messaging/deal-desk-actions";
import type { Database } from "@/lib/supabase/database.types";
import { authRoutes } from "@/lib/navigation";

type AgreementEventRow = Database["public"]["Tables"]["agreement_events"]["Row"];

type ContractDocumentsPanelProps = {
  agreementId: string;
  signedContractUrl: string | null;
  contractStatus: string;
  contractUploadedAt: string | null;
  contractExecutedAt: string | null;
  events: AgreementEventRow[];
};

function formatEventType(t: string): string {
  switch (t) {
    case "contract_link_opened":
      return "Contract access";
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
  events,
}: ContractDocumentsPanelProps) {
  const highlight = new Set([
    "contract_link_opened",
    "dispute_escalation",
    "stripe_payment_succeeded",
    "stripe_payment_failed",
    "stripe_amount_mismatch",
    "stripe_payment_processing",
  ]);
  const deskEvents = events.filter((e) => highlight.has(e.event_type));

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-white/10 bg-[#091c3d]/45 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Deal desk</p>
        <p className="mt-1 text-xs text-slate-500">
          Contract link opens in a new browser context when available; each open is written to the agreement timeline
          for counterparties and ops.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span className="rounded border border-white/10 bg-black/25 px-2 py-1">
          File status: <span className="font-semibold text-slate-200">{contractStatus}</span>
        </span>
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

      {signedContractUrl ?
        <form action={logContractOpenAction} className="flex flex-col gap-2">
          <input type="hidden" name="agreementId" value={agreementId} />
          <button
            type="submit"
            className="w-fit rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] transition-colors hover:bg-[#ffd14d]"
          >
            Open executed contract (access logged)
          </button>
          <p className="text-[11px] text-slate-500">
            Use this button so your view is recorded on the audit trail—avoid pasting the URL into a raw browser tab if
            you need lineage on-file.
          </p>
        </form>
      : <p className="text-sm text-slate-500">
          No contract URL on file yet. When ops attaches the executed PDF or e-sign packet, it will surface here.
        </p>
      }

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
