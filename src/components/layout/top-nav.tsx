import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "@/app/(auth)/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { CategoryNavStrip } from "@/components/layout/category-nav-strip";
import { GlobalCatalogSearch } from "@/components/layout/global-catalog-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { APP_NAME, NAV_TAGLINE } from "@/lib/config/marketplace";
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

  const navLink =
    "inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--nav-muted)] transition-colors hover:bg-white/10 hover:text-[var(--gold)] sm:text-xs md:py-1 md:text-xs";

  return (
    <header className="sticky top-0 z-30 shadow-[0_4px_24px_rgba(5,27,53,0.18)]">
      <div className="border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-3 py-2 md:flex-nowrap md:gap-4 md:px-4 md:py-2.5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 leading-tight rounded-sm transition-opacity hover:opacity-95"
          >
            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-md border border-[var(--gold)]/60 bg-[var(--gold)]/10">
              <Image src="/branding/psm-mark.svg" alt="PSM" width={32} height={32} />
            </span>
            <span className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--gold)]">{APP_NAME}</span>
              <span className="hidden text-[10px] text-[var(--nav-muted)] sm:inline">{NAV_TAGLINE}</span>
            </span>
          </Link>

          <GlobalCatalogSearch defaultQuery={marketplaceSearchDefault ?? ""} />

          <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:justify-normal md:gap-3">
            {user ?
              <Link href={authRoutes.messages} className={navLink}>
                Messages
              </Link>
            : null}
            {user ?
              <Link href={authRoutes.account} className={navLink}>
                Account
              </Link>
            : null}
            <ThemeToggle className="border-[var(--nav-border)] bg-white/10 text-[var(--nav-text)] hover:border-[var(--gold)] hover:bg-white/15" />
            {user ?
              <>
                <div className="hidden text-xs md:block lg:max-w-[140px]">
                  <span className="block text-[10px] leading-none text-[var(--nav-muted)]">Hello,</span>
                  <span className="truncate font-semibold text-[var(--nav-text)]">{emailPreview}</span>
                </div>
                <form action={signOutAction} className="inline">
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold text-[var(--nav-text)] transition-colors hover:bg-white/10 md:text-sm"
                  >
                    Sign out
                  </button>
                </form>
              </>
            : <>
                <Link
                  href={authRoutes.signUp}
                  className="rounded-md bg-[var(--gold)] px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#051b35] shadow-md shadow-black/30 transition-colors hover:brightness-105 active:translate-y-px md:text-xs"
                >
                  Create account
                </Link>
                <Link
                  href={authRoutes.signIn}
                  className="group flex flex-col rounded-md px-2 py-0.5 transition-colors hover:bg-white/5"
                >
                  <span className="text-[10px] text-[var(--nav-muted)] group-hover:text-[var(--nav-text)]">
                    Already registered?
                  </span>
                  <span className="text-sm font-bold leading-tight text-[var(--nav-text)]">Sign in</span>
                </Link>
              </>
            }

            <div className="hidden h-8 w-px bg-[var(--nav-border)] md:block" aria-hidden />

            <Link
              href="/buyer"
              className="hidden flex-col rounded-md px-2 py-0.5 transition-colors hover:bg-white/5 md:flex"
            >
              <span className="text-[10px] text-[var(--nav-muted)]">Buying</span>
              <span className="text-sm font-bold text-[var(--nav-text)]">&amp; offers</span>
            </Link>

            <Link
              href="/seller"
              className="rounded-md border border-[var(--gold)]/50 bg-[var(--gold)]/15 px-3 py-2 text-xs font-bold text-[var(--gold)] transition-colors hover:bg-[var(--gold)]/25 md:text-sm"
            >
              Sell
            </Link>
          </div>
        </div>
      </div>
      <CategoryNavStrip />
      <div className="mx-auto hidden max-w-7xl flex-wrap gap-1 border-b border-[var(--steel-line)] bg-[var(--card-muted)] px-4 py-2 text-[11px] text-[var(--muted)] xl:flex">
        {(role === "admin" ? dashboardLinks : dashboardLinks.filter((l) => l.href !== "/admin")).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded px-2 py-1 text-[var(--muted)] transition-colors hover:bg-white/80 hover:text-[var(--foreground)]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
