type DealTimelineProps = {
  agreementStatus: string;
  dealCheckpointLabel?: string | null;
  paidInstallments: number;
  scheduledInstallments: number;
  latestEventLabel?: string | null;
};

const STEPS: ReadonlyArray<{ key: string; title: string; desc: string }> = [
  { key: "apply", title: "Application", desc: "Messaging + drafts" },
  { key: "sign", title: "Contract", desc: "Signatures & activation" },
  { key: "pay", title: "Pay schedule", desc: "Deposits + installments" },
  { key: "done", title: "Settlement", desc: "Complete / recovery" },
];

function stepHighlightIndex(status: string): number {
  switch (status) {
    case "draft":
      return 0;
    case "signed":
      return 1;
    case "active":
      return 2;
    case "completed":
      return 3;
    case "defaulted":
    case "cancelled":
      return 2;
    default:
      return 0;
  }
}

export function DealTimeline({
  agreementStatus,
  dealCheckpointLabel,
  paidInstallments,
  scheduledInstallments,
  latestEventLabel,
}: DealTimelineProps) {
  const focusIdx = stepHighlightIndex(agreementStatus);

  return (
    <div className="rounded-xl border border-white/10 bg-[#091c3d]/55 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Deal timeline</p>
      {dealCheckpointLabel ?
        <p className="mt-2 text-xs text-slate-300">
          Ops checkpoint: <span className="font-semibold text-slate-100">{dealCheckpointLabel}</span>
        </p>
      : null}
      {latestEventLabel ?
        <p className="mt-2 text-xs text-slate-400">
          Latest activity: <span className="text-slate-200">{latestEventLabel}</span>
        </p>
      : null}
      <p className="mt-1 text-xs text-slate-500">
        Payments tracked:{" "}
        <span className="font-semibold text-slate-300">{paidInstallments}</span> paid ·{" "}
        <span className="font-semibold text-slate-300">{scheduledInstallments}</span> still scheduled / open
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {STEPS.map((step, idx) => {
          const done =
            idx < focusIdx || (agreementStatus === "completed" && idx <= focusIdx);
          const current = idx === focusIdx && agreementStatus !== "completed";
          const danger = agreementStatus === "defaulted" && idx >= 2;
          const cancelled = agreementStatus === "cancelled";

          let ring = "border-white/15 text-slate-500";
          if (danger) ring = "border-red-400/35 bg-red-950/35 text-red-100";
          else if (cancelled && idx <= focusIdx) ring = "border-slate-500/40 bg-black/35 text-slate-300";
          else if (done) ring = "border-gold bg-gold/15 text-gold";
          else if (current) ring = "border-gold/70 bg-black/35 text-white";

          return (
            <div key={step.key} className={`rounded-lg border px-3 py-3 text-xs leading-snug ${ring}`}>
              <p className="font-bold text-[11px] uppercase tracking-wide">{step.title}</p>
              <p className="mt-1 opacity-90">{step.desc}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Operational mirror only—loan/escrow specifics live in contracts and Stripe artifacts.
      </p>
    </div>
  );
}
