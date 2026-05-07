type TransferPlaybookPanelProps = {
  dense?: boolean;
};

const STEPS = [
  "Buyer pre-qualifies (business + credit profile for the lender/lessor).",
  "Seller and buyer align on who pays transfer/application fees.",
  "Lender/lessor reviews eligibility and approves transfer path.",
  "Insurance and handoff packet are finalized before possession.",
  "Confirmation is issued and ongoing payment milestones are tracked.",
] as const;

const GOTCHAS = [
  "Some contracts block out-of-state transfers or late-term transfers.",
  "Platform listings can be accurate and still fail lender approval.",
  "Transfer and screening fees vary by lender and are not always refundable.",
] as const;

/**
 * Marketplace-grade expectations for equipment payment-transfer workflows.
 * Keeps users grounded in the lender-gated reality before they apply.
 */
export function TransferPlaybookPanel({ dense }: TransferPlaybookPanelProps) {
  return (
    <section className={`rounded-xl border border-[var(--steel-line)] bg-[var(--card-muted)] ${dense ? "p-4" : "p-5"}`}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Transfer playbook</h2>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Lender or lessor approval decides whether a transfer can close. Every lane on the platform is built around that
        reality.
      </p>
      <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-muted">
        {STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted">Before you commit</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-muted">
        {GOTCHAS.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
