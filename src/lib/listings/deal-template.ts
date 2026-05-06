import type { Database } from "@/lib/supabase/database.types";

export type DealTemplate = Database["public"]["Tables"]["listings"]["Row"]["deal_template"];
export type DealCheckpoint = Database["public"]["Tables"]["payment_agreements"]["Row"]["deal_checkpoint"];

export const DEAL_TEMPLATES: readonly DealTemplate[] = [
  "assumption",
  "payment_swap_private",
  "lease_to_own",
] as const;

/** Ordered milestones for ops / admin tooling (subset may apply per lane). */
export const DEAL_CHECKPOINTS: readonly DealCheckpoint[] = [
  "intake",
  "buyer_qualified",
  "lender_workflow",
  "permissibility_documented",
  "lender_cleared",
  "insurance_gate",
  "handoff_complete",
  "servicing_active",
  "payoff_title",
  "completed",
] as const;

export function parseDealCheckpoint(raw: string): DealCheckpoint {
  const v = raw.trim() as DealCheckpoint;
  if ((DEAL_CHECKPOINTS as readonly string[]).includes(v)) return v;
  throw new Error("Invalid deal checkpoint.");
}

const DEAL_TEMPLATE_LABEL: Record<DealTemplate, string> = {
  assumption: "Lender-approved assumption / transfer",
  payment_swap_private: "Private payment swap (seller stays on the loan)",
  lease_to_own: "Lease-to-own toward title / payoff",
};

const DEAL_CHECKPOINT_LABEL: Record<DealCheckpoint, string> = {
  intake: "Deal room opened",
  buyer_qualified: "Buyer verification / qualification",
  lender_workflow: "Lender or lessor paperwork",
  permissibility_documented: "Contract permissibility documented",
  lender_cleared: "Lender / legal clearance",
  insurance_gate: "Insurance bound (additional insured / loss payee)",
  handoff_complete: "Equipment handed off & documented",
  servicing_active: "Payment stream active on platform rails",
  payoff_title: "Payoff, option, or title release",
  completed: "Deal completed",
};

export function dealTemplateLabel(template: DealTemplate): string {
  return DEAL_TEMPLATE_LABEL[template] ?? template;
}

export function dealCheckpointLabel(checkpoint: DealCheckpoint): string {
  return DEAL_CHECKPOINT_LABEL[checkpoint] ?? checkpoint;
}

/** Valid `deal=` query values for `/marketplace` URLs and API-style filters (no throw). */
export function parseMarketplaceDealFilter(raw: string | undefined): DealTemplate | undefined {
  if (!raw?.trim()) return undefined;
  const key = raw.trim().toLowerCase();
  return DEAL_TEMPLATES.some((d) => d === key) ? (key as DealTemplate) : undefined;
}

export function parseDealTemplate(raw: string): DealTemplate {
  const v = parseMarketplaceDealFilter(raw);
  if (!v) {
    throw new Error("Choose a valid deal template.");
  }
  return v;
}

export function requiredDocumentBullets(input: {
  deal_template: DealTemplate;
  collateral_is_titled: boolean;
}): string[] {
  const base = [
    "Government-issued ID (seller; buyer at offer stage)",
    "Proof of business entity when transacting as a company",
  ];

  const titled = input.collateral_is_titled;

  const collateralLine = titled
    ? "Title or registration + VIN match; lienholder name on record"
    : "Serial plate photo + ownership / UCC / lien documentation as applicable";

  const insurance = [
    "Commercial equipment insurance certificate",
    "Additional insured + loss payee per deal packet (match lienholder when required)",
  ];

  switch (input.deal_template) {
    case "assumption":
      return [
        ...base,
        collateralLine,
        "Current lender/lessor statement or schedule showing account and collateral",
        "Formal assumption / transfer package submitted to lender (status tracked in thread)",
        ...insurance,
        "Pre-handoff inspection (photos + hours/miles)",
      ];
    case "payment_swap_private":
      return [
        ...base,
        collateralLine,
        "Written acknowledgment: seller typically remains borrower to the lender unless otherwise released",
        "Loan/lease permissibility excerpt or counsel review upload (recommended)",
        ...insurance,
        "Executed swap agreement + disbursement rules if using platform collections",
        "Pre-handoff inspection (photos + hours/miles)",
      ];
    case "lease_to_own":
      return [
        ...base,
        collateralLine,
        "Schedule: payments, purchase option or payoff pathway, start timing",
        ...insurance,
        "Lease-to-own / rent-to-own agreement (template or attorney-led)",
        "Pre-handoff inspection (photos + hours/miles)",
      ];
    default: {
      const _exhaustive: never = input.deal_template;
      return [_exhaustive];
    }
  }
}
