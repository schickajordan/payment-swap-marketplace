import { authRoutes } from "@/lib/navigation";

/** Reject open redirects: only relative in-app destinations. */
export function sanitizeAppPath(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }

  const v = raw.trim();
  const pathOnly = v.split("?")[0]?.split("#")[0] ?? v;

  if (!pathOnly.startsWith("/") || pathOnly.startsWith("//") || pathOnly.includes("://")) {
    return null;
  }

  const exact = new Set(["/", "/marketplace", authRoutes.account, authRoutes.messages]);
  if (exact.has(pathOnly)) {
    return pathOnly;
  }

  if (pathOnly.startsWith("/listings/") && pathOnly.length > "/listings/".length) {
    return pathOnly;
  }

  if (
    pathOnly.startsWith("/buyer")
    && (pathOnly === "/buyer" || pathOnly.startsWith("/buyer/"))
  ) {
    return pathOnly;
  }

  if (
    pathOnly.startsWith("/seller")
    && (pathOnly === "/seller" || pathOnly.startsWith("/seller/"))
  ) {
    return pathOnly;
  }

  if (
    pathOnly.startsWith("/admin")
    && (pathOnly === "/admin" || pathOnly.startsWith("/admin/"))
  ) {
    return pathOnly;
  }

  if (
    pathOnly.startsWith(authRoutes.messages)
    && (pathOnly === authRoutes.messages || pathOnly.startsWith(`${authRoutes.messages}/`))
  ) {
    return pathOnly;
  }

  return null;
}
