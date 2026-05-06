#!/usr/bin/env node
/**
 * Prints production URLs and env placeholders for paymentswap.net (or whatever
 * RESERVED_PUBLIC_DOMAIN is in src/lib/config/marketplace.ts). Run after domain purchase.
 * OAuth / password-recovery redirect examples are read from `authRoutes` in
 * `src/lib/navigation.ts` so they stay aligned with the app.
 *
 * Usage: npm run go-live
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { parseAuthRoutesFromNavigation } from "./lib/parse-auth-routes.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const marketplacePath = resolve(root, "src/lib/config/marketplace.ts");
const navigationPath = resolve(root, "src/lib/navigation.ts");
const src = readFileSync(marketplacePath, "utf8");
const m = src.match(/RESERVED_PUBLIC_DOMAIN\s*=\s*"([^"]+)"/);
const host = (m?.[1] ?? "paymentswap.net").replace(/^https?:\/\//, "").replace(/\/$/, "");

const navigationSrc = readFileSync(navigationPath, "utf8");
const parsedAuth = parseAuthRoutesFromNavigation(navigationSrc);
if (!parsedAuth.ok) {
  console.error(`go-live: ${parsedAuth.error}`);
  process.exit(1);
}
const { oauthCallback: oauthCallbackPath, updatePassword: updatePasswordPath } = parsedAuth.routes;

const apex = `https://${host}`;
const www = `https://www.${host}`;

console.log(`
=== Go-live URLs for ${host} ===
(Derived from RESERVED_PUBLIC_DOMAIN in src/lib/config/marketplace.ts)

Pick ONE canonical public URL — use it everywhere below.

--- Vercel → Environment Variables (Production) ---
NEXT_PUBLIC_APP_URL=${apex}

If www is canonical instead, use:
NEXT_PUBLIC_APP_URL=${www}

--- Stripe → Developers → Webhooks (same mode as your API keys: test vs live) ---
Endpoint URL: ${apex}/api/webhooks/stripe
(Replace ${apex} with ${www} if that is your canonical host.)

Copy the signing secret → STRIPE_WEBHOOK_SECRET in Vercel.

--- Supabase → Authentication → URL configuration ---
Site URL: (same origin as NEXT_PUBLIC_APP_URL above)

Redirect URLs — add patterns for BOTH hosts if users might land on either
before you set up apex↔www redirect in Vercel:
  ${apex}/**
  ${www}/**

--- Sanity ---
  ${apex}/api/health

--- DNS ---
In Vercel: Project → Settings → Domains → add ${host} and optionally www.${host}
Configure records at registrar exactly as Vercel shows.

`);

console.log(`--- Supabase → explicit auth paths (from authRoutes in navigation.ts) ---
Ensure Redirect URLs allow these (wildcards ** often cover them; list explicitly if your project is strict):
  Production: ${apex}${oauthCallbackPath}
  Production: ${apex}${updatePasswordPath}
  With www:   ${www}${oauthCallbackPath}
  With www:   ${www}${updatePasswordPath}
  Local dev:  http://localhost:3000${oauthCallbackPath}
  Local dev:  http://localhost:3000${updatePasswordPath}
`);
