import { dealTemplateLabel, requiredDocumentBullets } from "@/lib/listings/deal-template";
import type { Database } from "@/lib/supabase/database.types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

type ListingDealChecklistProps = {
  listing: Listing;
};

export function ListingDealChecklist({ listing }: ListingDealChecklistProps) {
  const bullets = requiredDocumentBullets({
    deal_template: listing.deal_template,
    collateral_is_titled: listing.collateral_is_titled,
  });

  return (
    <section className="mt-8 rounded-xl border border-white/10 bg-[#091c3d]/40 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gold">
        Swap lane &amp; documentation checklist
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        <span className="font-semibold text-white">{dealTemplateLabel(listing.deal_template)}</span>
        {listing.collateral_is_titled ?
          <>
            {" "}
            · <span className="text-slate-200">titled collateral (VIN path)</span>
          </>
        : (
          <>
            {" "}
            · <span className="text-slate-200">non-titled / serial verification path</span>
          </>
        )}
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Operational guide only—finalize requirements with contracts, lenders, insurers, and counsel.
      </p>
      <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-slate-300">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
