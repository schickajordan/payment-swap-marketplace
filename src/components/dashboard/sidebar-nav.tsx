"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/marketplace", label: "Browse" },
  { href: "/pricing", label: "Pricing" },
  { href: "/buyer", label: "Buyer" },
  { href: "/seller", label: "Seller" },
  { href: "/admin", label: "Ops / Admin" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="shrink-0 md:w-52">
      <details className="group mb-4 md:mb-0 md:open:block">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-[var(--steel-line)] bg-[var(--card-muted)] px-3 py-2 text-sm font-medium text-foreground md:hidden">
          Menu
          <span className="text-[var(--gold)] transition group-open:rotate-180">▾</span>
        </summary>
        <nav className="mt-2 flex flex-col gap-1 pb-4 md:mt-0 md:sticky md:top-24 md:flex md:rounded-lg md:border md:border-[var(--steel-line)] md:bg-[var(--card)] md:p-2 md:shadow-sm">
          <p className="hidden px-2 pb-2 text-[10px] font-semibold uppercase tracking-wide text-muted md:block">
            Workspace
          </p>
          {items.map(({ href, label }) => {
            const normalized = href.endsWith("/") ? href.slice(0, -1) : href;
            const active =
              pathname === href ||
              pathname === normalized ||
              (normalized !== "/" && pathname.startsWith(`${normalized}/`));

            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "border border-[var(--gold)]/35 bg-[var(--gold)]/12 font-semibold text-[var(--gold-strong)]"
                    : "text-foreground hover:bg-[var(--card-muted)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </details>
    </div>
  );
}
