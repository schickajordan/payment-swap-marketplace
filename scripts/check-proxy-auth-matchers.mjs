#!/usr/bin/env node
/**
 * Catches drift between `src/lib/navigation.ts` and:
 * - `src/proxy.ts` `config.matcher` vs `authRoutes` (Next.js requires static matcher literals)
 * - `src/proxy.ts` role redirect vs `appRoutes.unauthorized`
 * - `src/lib/auth/authorization.ts` vs `authRoutes.signIn` / imports
 * - `signInUrlWithNext` implementation vs `authRoutes.signIn`
 * - `(auth)/actions.ts` password reset + Google OAuth `redirectTo` use `authRoutes.updatePassword` / `oauthCallback`
 * - `src/lib/auth/sanitize-app-path.ts` exact allowlist + messages guard vs `authRoutes`
 * - No `redirect("…")` / `redirect(\`…\`)` / `new URL("…")` / `new URL(\`…\`)` under `src/` for auth shell paths or unauthorized
 * - `scripts/go-live-values.mjs` imports `./lib/parse-auth-routes.mjs` (same parser as this script)
 * - No `middleware.{ts,js}` at repo root or under `src/` (Next.js 16 errors when both exist alongside `src/proxy.ts`)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseAppRoutesUnauthorizedFromNavigation,
  parseAuthRoutesFromNavigation,
} from "./lib/parse-auth-routes.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const navPath = path.join(root, "src/lib/navigation.ts");
const proxyPath = path.join(root, "src/proxy.ts");
const sanitizePath = path.join(root, "src/lib/auth/sanitize-app-path.ts");
const authActionsPath = path.join(root, "src/app/(auth)/actions.ts");

const nav = fs.readFileSync(navPath, "utf8");
const proxy = fs.readFileSync(proxyPath, "utf8");
const sanitize = fs.readFileSync(sanitizePath, "utf8");
const authActions = fs.readFileSync(authActionsPath, "utf8");
const goLivePath = path.join(root, "scripts/go-live-values.mjs");
const goLiveBody = fs.readFileSync(goLivePath, "utf8");
if (!goLiveBody.includes('from "./lib/parse-auth-routes.mjs"')) {
  console.error(
    "check-proxy-auth-matchers: `scripts/go-live-values.mjs` must import from `./lib/parse-auth-routes.mjs` (shared parser with this script)."
  );
  process.exit(1);
}
if (!goLiveBody.includes("parseAuthRoutesFromNavigation")) {
  console.error(
    "check-proxy-auth-matchers: `scripts/go-live-values.mjs` must call parseAuthRoutesFromNavigation for Supabase redirect examples."
  );
  process.exit(1);
}

for (const rel of [
  "src/middleware.ts",
  "src/middleware.js",
  "middleware.ts",
  "middleware.js",
]) {
  const mwPath = path.join(root, rel);
  if (fs.existsSync(mwPath)) {
    console.error(
      `check-proxy-auth-matchers: remove ${rel} — Next.js errors when both middleware and src/proxy.ts exist; keep proxy only.`
    );
    process.exit(1);
  }
}

const parsedAuth = parseAuthRoutesFromNavigation(nav);
if (!parsedAuth.ok) {
  console.error(`check-proxy-auth-matchers: ${parsedAuth.error}`);
  process.exit(1);
}
const {
  messages,
  account,
  signIn,
  signUp,
  forgotPassword,
  updatePassword,
  oauthCallback,
} = parsedAuth.routes;

const expectedFromAuth = new Set([
  messages,
  `${messages}/:path*`,
  account,
  `${account}/:path*`,
  signIn,
  signUp,
]);

const configMatch = proxy.match(/export const config = \{[\s\S]*?matcher:\s*\[([\s\S]*?)\]\s*,?\s*\}\s*;/);
if (!configMatch) {
  console.error("check-proxy-auth-matchers: could not find `export const config = { matcher: [...] }` in proxy.ts");
  process.exit(1);
}

const matcherInner = configMatch[1];
const matcherPaths = [...matcherInner.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const matcherSet = new Set(matcherPaths);

const missing = [...expectedFromAuth].filter((p) => !matcherSet.has(p));
if (missing.length > 0) {
  console.error(
    "check-proxy-auth-matchers: proxy `config.matcher` is missing entries required by `authRoutes`:\n  " +
      missing.join("\n  ")
  );
  console.error("\nUpdate `src/proxy.ts` `matcher` to include these paths (static string literals only).");
  process.exit(1);
}

if (!proxy.includes("new URL(appRoutes.unauthorized, request.url)")) {
  console.error(
    "check-proxy-auth-matchers: `proxy.ts` must redirect failed role checks with:\n" +
      "  new URL(appRoutes.unauthorized, request.url)"
  );
  process.exit(1);
}

const navImportFromLib = /\bimport\s*\{[^}]*\bappRoutes\b[^}]*\bauthRoutes\b[^}]*\}\s*from\s*["']@\/lib\/navigation["']/;
const navImportFromLibAlt =
  /\bimport\s*\{[^}]*\bauthRoutes\b[^}]*\bappRoutes\b[^}]*\}\s*from\s*["']@\/lib\/navigation["']/;
if (!navImportFromLib.test(proxy) && !navImportFromLibAlt.test(proxy)) {
  console.error(
    "check-proxy-auth-matchers: `proxy.ts` must import `appRoutes` and `authRoutes` from `@/lib/navigation`"
  );
  process.exit(1);
}

if (!nav.includes("${authRoutes.signIn}?next=${encodeURIComponent(nextPath)}")) {
  console.error(
    "check-proxy-auth-matchers: `signInUrlWithNext` in navigation.ts must build URLs from authRoutes.signIn + encodeURIComponent(nextPath)"
  );
  process.exit(1);
}

const resetPasswordRedirectNeedle = '`${getCanonicalSiteUrl()}${authRoutes.updatePassword}`';
if (!authActions.includes(resetPasswordRedirectNeedle)) {
  console.error(
    "check-proxy-auth-matchers: `(auth)/actions.ts` resetPassword `redirectTo` must use `getCanonicalSiteUrl()` + `authRoutes.updatePassword` in one template literal"
  );
  process.exit(1);
}

const googleOAuthRedirectNeedle =
  "`${getCanonicalSiteUrl()}${authRoutes.oauthCallback}?next=${encodeURIComponent(next)}`";
if (!authActions.includes(googleOAuthRedirectNeedle)) {
  console.error(
    "check-proxy-auth-matchers: `(auth)/actions.ts` Google OAuth `redirectTo` must use getCanonicalSiteUrl + authRoutes.oauthCallback + next query"
  );
  process.exit(1);
}

const parsedApp = parseAppRoutesUnauthorizedFromNavigation(nav);
if (!parsedApp.ok) {
  console.error(`check-proxy-auth-matchers: ${parsedApp.error}`);
  process.exit(1);
}
const { unauthorized: unauthorizedPath } = parsedApp;

const mustReferenceAppRoutesUnauthorized = [
  "src/lib/auth/authorization.ts",
  "src/app/messaging/actions.ts",
  "src/app/seller/listings/[id]/media/page.tsx",
];

for (const rel of mustReferenceAppRoutesUnauthorized) {
  const abs = path.join(root, rel);
  const body = fs.readFileSync(abs, "utf8");
  if (!body.includes("appRoutes.unauthorized")) {
    console.error(`check-proxy-auth-matchers: ${rel} must call redirect(appRoutes.unauthorized) for wrong-role flows`);
    process.exit(1);
  }
  const appRoutesImport =
    /\bimport\s*\{[^}]*\bappRoutes\b[^}]*\}\s*from\s*["']@\/lib\/navigation["']/;
  if (!appRoutesImport.test(body)) {
    console.error(`check-proxy-auth-matchers: ${rel} must import appRoutes from "@/lib/navigation"`);
    process.exit(1);
  }
}

const authorizationPath = path.join(root, "src/lib/auth/authorization.ts");
const authorizationBody = fs.readFileSync(authorizationPath, "utf8");
if (!authorizationBody.includes("redirect(authRoutes.signIn)")) {
  console.error(
    "check-proxy-auth-matchers: `authorization.ts` must use redirect(authRoutes.signIn) when session is missing"
  );
  process.exit(1);
}
const authRoutesImportInAuthorization =
  /\bimport\s*\{[^}]*\bauthRoutes\b[^}]*\}\s*from\s*["']@\/lib\/navigation["']/;
if (!authRoutesImportInAuthorization.test(authorizationBody)) {
  console.error(
    "check-proxy-auth-matchers: `authorization.ts` must import authRoutes from `@/lib/navigation`"
  );
  process.exit(1);
}

/** Forbid string-literal redirect() / new URL() bases for auth shell paths (single source: authRoutes / appRoutes). */
function literalAuthRedirectPatterns(routePath) {
  return [
    `redirect("${routePath}"`,
    `redirect('${routePath}'`,
    `redirect(\`${routePath}\``,
    `new URL("${routePath}"`,
    `new URL('${routePath}'`,
    `new URL(\`${routePath}\``,
  ];
}

const literalUnauthorizedPatterns = literalAuthRedirectPatterns(unauthorizedPath);
const authShellPaths = [messages, account, signIn, signUp, forgotPassword, updatePassword, oauthCallback];

function* walkTsFiles(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === ".next") continue;
      yield* walkTsFiles(full);
    } else if (
      ent.isFile()
      && (ent.name.endsWith(".ts") || ent.name.endsWith(".tsx"))
      && !ent.name.endsWith(".d.ts")
    ) {
      yield full;
    }
  }
}

const srcRoot = path.join(root, "src");
const navigationTs = path.join(root, "src/lib/navigation.ts");
for (const file of walkTsFiles(srcRoot)) {
  if (file === navigationTs) continue;
  const body = fs.readFileSync(file, "utf8");
  for (const pat of literalUnauthorizedPatterns) {
    if (body.includes(pat)) {
      console.error(
        `check-proxy-auth-matchers: do not redirect with a string literal to ${unauthorizedPath} — use appRoutes.unauthorized.\n` +
          `  Offending file: ${path.relative(root, file)}\n` +
          `  Pattern: ${pat}`
      );
      process.exit(1);
    }
  }
  for (const p of authShellPaths) {
    for (const pat of literalAuthRedirectPatterns(p)) {
      if (body.includes(pat)) {
        console.error(
          `check-proxy-auth-matchers: do not use string-literal redirect/URL base for ${p} — use authRoutes from @/lib/navigation.\n` +
            `  Offending file: ${path.relative(root, file)}\n` +
            `  Pattern: ${pat}`
        );
        process.exit(1);
      }
    }
  }
}

const sanitizeExactSet =
  /const exact = new Set\(\[\s*"\/",\s*"\/marketplace",\s*authRoutes\.account,\s*authRoutes\.messages\s*\]\)/;
if (!sanitizeExactSet.test(sanitize)) {
  console.error(
    "check-proxy-auth-matchers: `sanitize-app-path.ts` must define `exact` as:\n" +
      '  new Set(["/", "/marketplace", authRoutes.account, authRoutes.messages])'
  );
  process.exit(1);
}

if (!sanitize.includes('import { authRoutes } from "@/lib/navigation"')) {
  console.error(
    'check-proxy-auth-matchers: `sanitize-app-path.ts` must import authRoutes from "@/lib/navigation"'
  );
  process.exit(1);
}

const sanitizeMessagesFragments = [
  "pathOnly.startsWith(authRoutes.messages)",
  "pathOnly === authRoutes.messages",
  "`${authRoutes.messages}/`", // substring as in source: startsWith(`${authRoutes.messages}/`)
];
const missingMsg = sanitizeMessagesFragments.filter((s) => !sanitize.includes(s));
if (missingMsg.length > 0) {
  console.error(
    "check-proxy-auth-matchers: `sanitize-app-path.ts` messages deep-link guard must use authRoutes.messages:\n  " +
      missingMsg.join("\n  ")
  );
  process.exit(1);
}

console.log(
  "check-proxy-auth-matchers: OK (proxy, auth actions redirectTo, authorization, appRoutes, literals, signInUrlWithNext, sanitize ↔ navigation, go-live parser, no middleware file)"
);
