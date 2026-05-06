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
    <div className="border-b border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2 md:py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] md:text-xs md:justify-between">
        {STRIP_ITEMS.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 text-center md:text-left">
            <span className="font-semibold text-foreground">{item.label}</span>
            <span className="hidden text-muted sm:inline">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
