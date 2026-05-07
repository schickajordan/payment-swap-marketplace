export type NavItem = {
  label: string;
  href: string;
};

/**
 * Auth, account hub, and messaging entry paths.
 * `src/proxy.ts` `config.matcher` must use the same path strings (Next.js requires static literals there).
 */
export const authRoutes = {
  account: "/account",
  signIn: "/sign-in",
  signUp: "/sign-up",
  acceptLegal: "/auth/accept-legal",
  forgotPassword: "/forgot-password",
  /** Supabase `redirectTo` after email recovery link (see `requestPasswordResetAction`). */
  updatePassword: "/auth/update-password",
  /** PKCE OAuth return handler (`signInWithOAuth` → `auth/callback/route.ts`). */
  oauthCallback: "/auth/callback",
  messages: "/messages",
} as const;

/** App shell routes outside marketing/auth (add here when reused across redirects). */
export const appRoutes = {
  unauthorized: "/unauthorized",
} as const;

/** `redirect(\`${authRoutes.signIn}?next=…\`)` without repeating encode rules. */
export function signInUrlWithNext(nextPath: string): string {
  return `${authRoutes.signIn}?next=${encodeURIComponent(nextPath)}`;
}

export const marketingNav: NavItem[] = [
  { label: "Overview", href: "/" },
  { label: "About", href: "/about" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

/** Footer “Get to know us”: same destinations as `marketingNav` minus marketplace (covered under Shop). */
const FOOTER_COMPANY_LABEL_OVERRIDES: Partial<Record<string, string>> = {
  "/about": "About us & verification",
  "/pricing": "Pricing & fees",
  "/terms": "Terms of service",
  "/privacy": "Privacy policy",
};

export const footerCompanyNav: NavItem[] = marketingNav
  .filter((item) => item.href !== "/marketplace")
  .map((item) => ({
    href: item.href,
    label: FOOTER_COMPANY_LABEL_OVERRIDES[item.href] ?? item.label,
  }));

/** Category strip: marketing anchors (home + marketplace already covered by logo / inventory). */
export const categoryStripMarketingLinks: NavItem[] = marketingNav.filter(
  (item) => item.href !== "/" && item.href !== "/marketplace"
);

export const dashboardLinks: NavItem[] = [
  { label: "Account", href: authRoutes.account },
  { label: "Seller Dashboard", href: "/seller" },
  { label: "Buyer Dashboard", href: "/buyer" },
  { label: "Admin Dashboard", href: "/admin" },
];

const FOOTER_DASHBOARD_ORDER = ["/buyer", "/seller", "/admin"] as const;

const FOOTER_DASHBOARD_LABEL: Record<(typeof FOOTER_DASHBOARD_ORDER)[number], string> = {
  "/buyer": "Buyer dashboard",
  "/seller": "Seller dashboard",
  "/admin": "Operations (authorized)",
};

function dashboardEntryOrThrow(href: string): NavItem {
  const hit = dashboardLinks.find((d) => d.href === href);
  if (!hit) {
    throw new Error(`navigation: dashboardLinks must include ${href}`);
  }
  return hit;
}

const accountDashboard = dashboardEntryOrThrow(authRoutes.account);

/** Footer “Your account” column — dashboard hrefs come from `dashboardLinks`; proxy guards protected routes. */
export const footerAccountNav: NavItem[] = [
  { label: "Sign in", href: authRoutes.signIn },
  { label: "Create account", href: authRoutes.signUp },
  { label: "Account hub", href: accountDashboard.href },
  { label: "Messages", href: authRoutes.messages },
  ...FOOTER_DASHBOARD_ORDER.map((href) => ({
    href: dashboardEntryOrThrow(href).href,
    label: FOOTER_DASHBOARD_LABEL[href],
  })),
];
