import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appRoutes, authRoutes } from "@/lib/navigation";
import { DEFAULT_ROLE, isUserRole } from "@/lib/types/roles";

type RoleGate = Array<"seller" | "buyer" | "admin">;

const routePrefixProtection: Record<string, RoleGate> = {
  "/seller": ["seller", "admin"],
  "/buyer": ["buyer", "admin", "seller"],
  "/admin": ["admin"],
  [authRoutes.messages]: ["buyer", "admin", "seller"],
};

function requiredRoles(pathname: string): RoleGate | null {
  if (pathname === authRoutes.account || pathname.startsWith(`${authRoutes.account}/`)) {
    return ["buyer", "seller", "admin"];
  }

  const prefixMatch = Object.keys(routePrefixProtection).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return prefixMatch ? routePrefixProtection[prefixMatch] ?? null : null;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const allowedRoles = requiredRoles(pathname);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (allowedRoles && !user) {
    /** Always preserve destination so sign-in returns to the intended dashboard (e.g. `/seller`, `/messages`). */
    const signTarget = `${authRoutes.signIn}?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(new URL(signTarget, request.url));
  }

  if (allowedRoles && user) {
    const roleCandidate = user.user_metadata?.role;
    const role = isUserRole(roleCandidate) ? roleCandidate : DEFAULT_ROLE;

    if (!allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL(appRoutes.unauthorized, request.url));
    }
  }

  if (pathname === authRoutes.signIn && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === authRoutes.signUp && user) {
    return NextResponse.redirect(new URL(authRoutes.account, request.url));
  }

  return response;
}

/** Must stay in sync with `authRoutes` in `@/lib/navigation` (Next requires static matcher strings). */
export const config = {
  matcher: [
    "/seller/:path*",
    "/buyer/:path*",
    "/admin/:path*",
    "/messages",
    "/messages/:path*",
    "/account",
    "/account/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
