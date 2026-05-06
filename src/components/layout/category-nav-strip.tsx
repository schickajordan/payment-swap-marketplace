import Link from "next/link";
import { INITIAL_FOCUS_CATEGORIES } from "@/lib/config/marketplace";
import { categoryStripMarketingLinks } from "@/lib/navigation";
import { marketplaceQueryString } from "@/lib/marketplace/url";

export function CategoryNavStrip() {
  return (
    <div className="border-t border-[var(--steel-line)] bg-card px-2 py-2 md:px-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 text-[13px] md:gap-2 md:text-sm">
        <nav
          aria-label="Shop by category"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-1 md:gap-2"
        >
          <Link
            href="/marketplace"
            className="rounded px-2 py-1.5 font-semibold text-foreground transition-colors hover:bg-[var(--card-muted)] hover:text-[var(--gold-strong)]"
          >
            All inventory
          </Link>
          <span className="hidden text-[var(--muted)] md:inline" aria-hidden>
            |
          </span>
          {INITIAL_FOCUS_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/marketplace${marketplaceQueryString({ category: cat })}`}
              className="rounded px-2 py-1.5 capitalize text-[var(--muted)] transition-colors hover:bg-[var(--card-muted)] hover:text-[var(--foreground)]"
            >
              {cat}
            </Link>
          ))}
        </nav>
        <nav
          aria-label="Company"
          className="mt-2 flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--steel-line)] pt-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)] sm:mt-0 sm:w-auto sm:border-t-0 sm:pt-0 md:gap-x-4 md:border-l md:border-t-0 md:pl-4 md:text-[12px]"
        >
          {categoryStripMarketingLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-1.5 py-1 text-[var(--muted)] transition-colors hover:bg-[var(--card-muted)] hover:text-[var(--gold-strong)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
