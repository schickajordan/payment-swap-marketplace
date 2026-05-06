import Link from "next/link";
import { signOutAction } from "@/app/(auth)/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { CategoryNavStrip } from "@/components/layout/category-nav-strip";
import { GlobalCatalogSearch } from "@/components/layout/global-catalog-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME } from "@/lib/config/marketplace";
import { authRoutes, dashboardLinks } from "@/lib/navigation";

type TopNavProps = {
  /** When embedded on marketplace, preserve search query in header omnibox. */
  marketplaceSearchDefault?: string;
};

export async function TopNav({ marketplaceSearchDefault }: TopNavProps) {
  const { user, role } = await getCurrentSession();

  const emailPreview =
    typeof user?.email === "string" && user.email.length > 0
      ? user.email.split("@")[0]?.slice(0, 14) ?? "Account"
      : null;

  return (
    <header className="sticky top-0 z-30 shadow-md shadow-black/10">
      <div className="border-b border-[var(--steel-line)] bg-[var(--charcoal-panel)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2 md:flex-nowrap md:gap-4 md:px-4 md:py-2.5">
          <Link
            href="/"
            className="flex shrink-0 flex-col gap-0 leading-tight rounded-sm transition-opacity hover:opacity-95"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold">{APP_NAME}</span>
            <span className="hidden text-[10px] text-[var(--muted)] sm:inline">
              Payment swaps · assumptions · lease-to-own
            </span>
          </Link>

          <GlobalCatalogSearch defaultQuery={marketplaceSearchDefault ?? ""} />

          <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:justify-normal md:gap-3">
            {user ?
              <Link
                href={authRoutes.messages}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-gold sm:text-xs md:py-1 md:text-xs"
              >
                Messages
              </Link>
            : null}
            {user ?
              <Link
                href={authRoutes.account}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-gold sm:text-xs md:py-1 md:text-xs"
              >
                Account
              </Link>
            : null}
            <ThemeToggle />
            {user ?
              <>
                <div className="hidden text-xs text-[var(--muted)] md:block lg:max-w-[140px]">
                  <span className="block text-[10px] leading-none text-[var(--muted)]">Hello,</span>
                  <span className="truncate font-semibold text-foreground">{emailPreview}</span>
                </div>
                <form action={signOutAction} className="inline">
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-white/10 md:text-sm"
                  >
                    Sign out
                  </button>
                </form>
              </>
            : <>
                <Link
                  href={authRoutes.signUp}
                  className="rounded-md bg-gold px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#071733] shadow-md shadow-black/25 transition-colors hover:bg-[#ffd14d] active:translate-y-px md:text-xs"
                >
                  Create account
                </Link>
                <Link
                  href={authRoutes.signIn}
                  className="group flex flex-col rounded-md px-2 py-0.5 transition-colors hover:bg-white/5"
                >
                  <span className="text-[10px] text-[var(--muted)] group-hover:text-foreground">Already registered?</span>
                  <span className="text-sm font-bold leading-tight text-foreground">Sign in</span>
                </Link>
              </>
            }

            <div className="hidden h-8 w-px bg-[var(--steel-line)] md:block" aria-hidden />

            <Link
              href="/buyer"
              className="hidden flex-col rounded-md px-2 py-0.5 transition-colors hover:bg-white/5 md:flex"
            >
              <span className="text-[10px] text-[var(--muted)]">Buying</span>
              <span className="text-sm font-bold text-foreground">&amp; offers</span>
            </Link>

            <Link
              href="/seller"
              className="rounded-md bg-gold/15 px-3 py-2 text-xs font-bold text-gold transition-colors hover:bg-gold/25 md:text-sm"
            >
              Sell
            </Link>
          </div>
        </div>
        <CategoryNavStrip />

        <div className="mx-auto hidden max-w-7xl flex-wrap gap-1 border-t border-[var(--steel-line)] px-4 py-2 text-[11px] text-[var(--muted)] xl:flex">
          {(role === "admin" ? dashboardLinks : dashboardLinks.filter((l) => l.href !== "/admin")).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1 text-[var(--muted)] transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
