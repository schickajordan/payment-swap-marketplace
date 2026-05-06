const STRIP_ITEMS = [
  { label: "Fast search & filters", detail: "Browse equipment like a storefront catalog" },
  { label: "Secure checkout", detail: "Card payments handled by Stripe" },
  { label: "Business-to-business only", detail: "Deals stay between verified companies" },
] as const;

export function TrustDeliveryStrip() {
  return (
    <div className="border-b border-white/10 bg-[#1b2637] px-4 py-2 md:py-2.5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] text-slate-200 md:text-xs md:justify-between">
        {STRIP_ITEMS.map((item) => (
          <div key={item.label} className="flex flex-col gap-0.5 text-center md:text-left">
            <span className="font-semibold text-white">{item.label}</span>
            <span className="hidden text-slate-400 sm:inline">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
