import { type QualificationSnapshot } from "@/lib/events/queries";

type QualificationSnapshotPanelProps = {
  snapshot: QualificationSnapshot;
  title?: string;
  className?: string;
};

/**
 * Shared panel for buyer pre-apply acknowledgements captured at application submission.
 * Rendered across admin, messaging, buyer, and seller agreement surfaces.
 */
export function QualificationSnapshotPanel({
  snapshot,
  title = "Pre-apply snapshot",
  className = "mt-3 rounded-lg border border-white/10 bg-[#091c3d]/45 p-3",
}: QualificationSnapshotPanelProps) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-1 text-xs text-slate-300">
        Transfer fee party: <span className="font-semibold text-white">{snapshot.transferFeeParty}</span>
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        Acknowledged — lender approval: {snapshot.lenderApprovalAck ? "yes" : "no"} · restrictions:{" "}
        {snapshot.restrictionsAck ? "yes" : "no"} · fee responsibility: {snapshot.feeAck ? "yes" : "no"}
      </p>
    </div>
  );
}
