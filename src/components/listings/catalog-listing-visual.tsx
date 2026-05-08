import Image from "next/image";

const BRAND_CATALOG_FALLBACK = "/branding/hero-industrial-premium.svg";

export type CatalogListingVisualProps = {
  /** Supabase public URL or other allowed image URL. */
  thumbnailUrl?: string;
  category: string;
  laneBadge: string;
  stateLabel: string | null;
  /** Passed from parent `group` for hover scale on real photos only. */
  imageClassName?: string;
};

/**
 * Hero image area for marketplace cards: real thumbnail when present; otherwise
 * on-brand industrial artwork so the grid never looks like an empty template.
 */
export function CatalogListingVisual({
  thumbnailUrl,
  category,
  laneBadge,
  stateLabel,
  imageClassName = "transition duration-500 group-hover:scale-[1.03]",
}: CatalogListingVisualProps) {
  const hasPhoto = Boolean(thumbnailUrl?.trim());

  return (
    <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#050b18] ring-1 ring-white/10">
      {hasPhoto ?
        <Image
          src={thumbnailUrl!}
          alt=""
          fill
          sizes="(max-width:640px) 100vw,(max-width:1280px) 33vw, 320px"
          className={`object-cover ${imageClassName}`}
          loading="lazy"
          quality={76}
        />
      : <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute inset-0 bg-cover bg-[center_62%] opacity-[0.92] ${imageClassName}`}
            style={{ backgroundImage: `url('${BRAND_CATALOG_FALLBACK}')` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050b18]/95 via-[#050b18]/35 to-[#050b18]/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_25%,rgba(242,183,5,0.14),transparent_50%)]"
            aria-hidden
          />
        </div>
      }
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-wrap items-center justify-between gap-1 px-3 text-[10px] font-semibold uppercase tracking-wide">
        <span className="rounded bg-black/60 px-2 py-0.5 text-gold">{category}</span>
        <span className="rounded bg-black/60 px-2 py-0.5 text-emerald-200/95">{laneBadge}</span>
        {stateLabel ?
          <span className="rounded bg-black/60 px-2 py-0.5 text-white">{stateLabel}</span>
        : null}
      </div>
    </div>
  );
}
