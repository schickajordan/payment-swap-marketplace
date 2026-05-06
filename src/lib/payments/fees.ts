/** Escrow-style platform take on each buyer collection (basis points). */
const ESCROW_FEE_BIPS = 250; // 2.5%

export function installmentApplicationFeeCents(amountCents: number, escrowEnabled: boolean): number {
  if (!escrowEnabled || amountCents <= 0) {
    return 0;
  }
  const raw = Math.floor((amountCents * ESCROW_FEE_BIPS) / 10000);
  const capped = Math.min(raw, Math.max(amountCents - 1, 0));
  return capped > 0 ? capped : 0;
}
