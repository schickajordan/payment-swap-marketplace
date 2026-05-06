/**
 * Shared parser for `authRoutes` / `appRoutes` blocks in `src/lib/navigation.ts`.
 * Used by `check-proxy-auth-matchers.mjs` and `go-live-values.mjs` so regexes
 * cannot drift between scripts.
 */

export function readStringProp(source, prop) {
  const re = new RegExp(`\\b${prop}\\s*:\\s*"([^"]+)"`);
  const m = source.match(re);
  return m?.[1] ?? null;
}

export function parseAuthRoutesFromNavigation(navSource) {
  const authBlock = navSource.match(/export const authRoutes = \{[\s\S]*?\n\} as const/);
  if (!authBlock) {
    return {
      ok: false,
      error: "could not find `export const authRoutes = { ... } as const`",
    };
  }
  const block = authBlock[0];
  const routes = {
    messages: readStringProp(block, "messages"),
    account: readStringProp(block, "account"),
    signIn: readStringProp(block, "signIn"),
    signUp: readStringProp(block, "signUp"),
    forgotPassword: readStringProp(block, "forgotPassword"),
    updatePassword: readStringProp(block, "updatePassword"),
    oauthCallback: readStringProp(block, "oauthCallback"),
  };
  const missing = Object.entries(routes)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length > 0) {
    return {
      ok: false,
      error: `failed to parse authRoutes strings (missing: ${missing.join(", ")})`,
      routes,
    };
  }
  return { ok: true, routes };
}

export function parseAppRoutesUnauthorizedFromNavigation(navSource) {
  const appBlock = navSource.match(/export const appRoutes = \{[\s\S]*?\n\} as const/);
  if (!appBlock) {
    return {
      ok: false,
      error: "could not find `export const appRoutes = { ... } as const`",
    };
  }
  const unauthorized = readStringProp(appBlock[0], "unauthorized");
  if (!unauthorized) {
    return { ok: false, error: "could not parse `appRoutes.unauthorized`" };
  }
  return { ok: true, unauthorized };
}
