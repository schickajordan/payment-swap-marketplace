import Link from "next/link";
import { APP_NAME, NAV_TAGLINE } from "@/lib/config/marketplace";

type BrandMarkProps = {
  compact?: boolean;
  href?: string;
};

export function BrandMark({ compact = false, href = "/" }: BrandMarkProps) {
  const badge = (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--gold)]/55 bg-[var(--gold)]/15 font-black tracking-tight text-[var(--gold)] shadow-[0_0_0_1px_rgba(5,27,53,0.35)_inset]"
    >
      PS
    </span>
  );

  if (compact) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 rounded-sm px-0.5 py-0.5 hover:opacity-95">
        {badge}
        <span className="text-[12px] font-bold uppercase tracking-widest text-[var(--gold)]">{APP_NAME}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className="flex items-center gap-2 rounded-sm transition-opacity hover:opacity-95">
      {badge}
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">{APP_NAME}</span>
        <span className="hidden truncate text-[10px] text-[var(--nav-muted)] sm:inline">{NAV_TAGLINE}</span>
      </span>
    </Link>
  );
}
