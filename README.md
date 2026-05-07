# Payment Swap Marketplace

Next.js marketplace for contractor equipment swaps: listings, Stripe Connect payouts, installments + deposits via Checkout, escrow-style application fees, Supabase Auth/RLS, deal threads with Realtime messaging, liquidity milestones for BI, reviews on listing PDP.

This document is meant for **production handoff**: environment, migration order, integrations, QA, and known boundaries.

**Custom domain / client rollout (HTTPS, DNS, Vercel, Supabase redirects, Stripe webhooks):** see **[DEPLOYMENT.md](./DEPLOYMENT.md)**. Reserved production host: **`paymentswap.net`** (`RESERVED_PUBLIC_DOMAIN` in `src/lib/config/marketplace.ts`).

---

## Requirements

- Node.js 20+
- npm 10+ (or compatible)
- A [Supabase](https://supabase.com/) project with Auth enabled
- A [Stripe](https://stripe.com/) account with **Connect**

---

## Environment variables

Copy `.env.example` to `.env.local` and fill values.

| Variable | Required for | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | App | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App | Browser + server user-scoped requests (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Checkout attach, Stripe webhooks, idempotent webhook ledger | Bypasses RLS (server-only, never expose to client) |
| `NEXT_PUBLIC_APP_URL` | Checkout return URLs, sitemap/canonicals, Stripe Connect redirects | Production must be **`https`** (no trailing slash) |
| `STRIPE_SECRET_KEY` | Seller Connect, buyer Checkout Sessions | Stripe API |
| `STRIPE_WEBHOOK_SECRET` | `/api/webhooks/stripe` | Verifies Stripe signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional today | Reserved for Stripe.js / Elements later (Checkout flows do not require it server-side). |
| `ALLOW_PUBLIC_ADMIN_SIGNUP` | Optional | Set to **`true`** only if you want **Admin** exposed on `/sign-up` (staging). **Omit in production** — create ops users in Supabase (see `DEPLOYMENT.md`). |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional | Shown on **`/support`** and demo fallbacks — business support inbox. |
| `NEXT_PUBLIC_DEMO_BOOKING_URL` | Optional | **`https://…`** (scheduling) or **`mailto:…`** — **Book a demo** on **`/demo`** and **`/support`**. |
| `NEXT_PUBLIC_HELP_CENTER_URL` | Optional | **`https://…`** — Zendesk / Notion / GitBook **Help center** link on **`/support`**. |

`/api/health` returns liveness plus which **env groups** are configured (never returns secret values). **`/.well-known/security.txt`** follows [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116.html) — update the contact email for your org. **`/support`** and **`/demo`** are the customer-facing help and tour entry points.

---

## Setup

```bash
npm ci
cp .env.example .env.local
# edit .env.local
```

Apply database migrations **in lexical order** (timestamps under `supabase/migrations/`). With Supabase CLI linked to your project:

```bash
supabase db push
# or replay SQL in the Dashboard SQL editor in the same order as migration filenames
```

**After migrations**

- Confirm **Realtime** can see `thread_messages` — migration adds the table to the `supabase_realtime` publication when applicable.
- In Stripe Dashboard → **Developers → Webhooks**, point to `https://<your-domain>/api/webhooks/stripe` and subscribe at minimum to `checkout.session.completed`, `payment_intent.processing`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`. Use signing secret as `STRIPE_WEBHOOK_SECRET`.
- For Connect, configure your platform branding and redirects; onboarding for sellers flows from the app using `NEXT_PUBLIC_APP_URL`.

---

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server (after build) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run verify` | Proxy consistency + lint + typecheck + build |
| `npm run audit:prod` | `npm audit` on **production** dependencies only (severity **high+**); dev-only advisories from `vercel` CLI are excluded |
| `npm run verify:full` | `audit:prod` then `verify` — recommended before tagging releases |

Continuous integration: `.github/workflows/ci.yml` runs `npm run audit:prod` then `npm run verify` on pushes to `main` / `master` and on pull requests (expects this directory to be the git repository root; in a monorepo, move or adjust `working-directory`).

---

## Architecture (short)

- **App Router** (`src/app`) — marketing, dashboards, PDP, Stripe webhook route, health.
- **Supabase** — Postgres + RLS, Auth cookies via Edge proxy (`src/proxy.ts`, Next.js replaces the old `middleware` convention), optional Realtime subscriptions in `AgreementThreadPanel`.
- **Stripe** — Checkout for buyer charges; Connect `transfer_data.destination` (+ optional application fee) when escrow is on for the agreement; webhook ledger table `stripe_webhook_events`.
- **Handoff-sensitive server paths** — `src/lib/supabase/service-role.ts`, `src/app/api/webhooks/stripe/route.ts`, buyer pay server action (`src/app/buyer/pay-actions.ts`).

---

## Operational QA before go-live

1. **`npm run verify:full`** succeeds (or `npm run audit:prod` + `npm run verify`).
2. **`GET /api/health`** — `checks.core_config` true; `checks.payments_pipeline` true in the environment where you take live money.
3. Sign-up / sign-in, role gates (`/seller`, `/buyer`, `/admin`) behave as intended.
4. Listing publish → appears on `/marketplace` and `/listings/[id]` (anon read for active listings).
5. Stripe Connect onboarding for a seller test account completes; payouts row shows charges + payouts enabled.
6. Buyer pays a scheduled installment (and optional deposit row when listing `deposit_cents` is positive) → webhook marks `agreement_payments` paid; admin liquidity feed shows milestones as applicable.
7. Deal thread messages: first message creates thread if needed; second browser sees **live** INSERT if Realtime publication is applied.

---

## Intentionally not shipped / future work

- No service worker caching (manifest + meta only for install-friendly surfaces).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` not wired until client-side Stripe primitives are introduced.
- If your machine has **another** `package-lock.json` above this folder, run commands from **`payment-swap-marketplace`** or rely on `turbopack.root` in `next.config.ts`.

---

## License

Private deployment; clarify licensing with repository owner.
