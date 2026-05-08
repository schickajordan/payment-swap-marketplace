const STRIP_ITEMS = [
  {
    label: "Lease & payment swaps",
    detail: "Assumption, takeover, and lease-to-own lanes—not generic rentals",
  },
  {
    label: "Documented qualification",
    detail: "Buyer snapshots & seller disclosures before paperwork advances",
  },
  {
    label: "Verified businesses",
    detail: "Counterparties onboarded as companies, not anonymous handles",
  },
] as const;

export function TrustDeliveryStrip() {
  return (
    <div className="border-b border-[var(--steel-line)] bg-gradient-to-b from-[var(--card-muted)] to-[var(--card)]/85 px-4 py-2 md:py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] md:text-xs md:justify-between">
        {STRIP_ITEMS.map((item) => (
          <div key={item.label} className="flex max-w-[260px] flex-col gap-0.5 text-center md:max-w-none md:text-left">
            <span className="inline-flex items-center justify-center gap-2 md:justify-start">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)] shadow-[0_0_12px_rgba(255,184,28,0.6)]"
                aria-hidden
              />
              <span className="font-semibold text-foreground">{item.label}</span>
            </span>
            <span className="hidden text-muted sm:inline sm:ps-4">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
