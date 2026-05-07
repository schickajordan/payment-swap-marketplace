import Link from "next/link";
import { APP_NAME, INITIAL_FOCUS_CATEGORIES } from "@/lib/config/marketplace";
import { footerAccountNav, footerCompanyNav } from "@/lib/navigation";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { marketplaceQueryString } from "@/lib/marketplace/url";

const footerLinkClass =
  "inline-block rounded-sm py-0.5 text-[var(--footer-text)] underline-offset-4 transition-colors hover:text-[var(--footer-link-hover)] hover:underline hover:decoration-[var(--gold)]/60";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--nav-border)] bg-[var(--footer-bg)] text-sm text-[var(--footer-text)]">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10 text-[10px] font-black tracking-wide text-[var(--gold)]">
                PSM
              </span>
              <p className="font-bold text-[var(--footer-heading)]">{APP_NAME}</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed">
              Find equipment with clear monthly terms; pay securely when you&apos;re ready. Business counterparties
              only.
            </p>
          </div>
          <nav aria-label="Company">
            <p className="font-semibold text-[var(--footer-heading)]">Get to know us</p>
            <ul className="mt-3 space-y-2 text-xs">
              {footerCompanyNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Shop">
            <p className="font-semibold text-[var(--footer-heading)]">Shop</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/marketplace" className={footerLinkClass}>
                  All inventory
                </Link>
              </li>
              {INITIAL_FOCUS_CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    href={`/marketplace${marketplaceQueryString({ category: c })}`}
                    className={`capitalize ${footerLinkClass}`}
                  >
                    {c}
                  </Link>
                </li>
              ))}
              <li className="pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--footer-text)]">
                Swap lanes
              </li>
              {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
                <li key={lane.deal}>
                  <Link href={lane.href} className={footerLinkClass}>
                    {lane.compactLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Account">
            <p className="font-semibold text-[var(--footer-heading)]">Your account</p>
            <ul className="mt-3 space-y-2 text-xs">
              {footerAccountNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-[var(--nav-border)] pt-6 text-[11px] leading-relaxed text-[var(--footer-text)]">
          © {new Date().getFullYear()} {APP_NAME}. For business counterparties only. Not a bank or lender.
        </p>
      </div>
    </footer>
  );
}
