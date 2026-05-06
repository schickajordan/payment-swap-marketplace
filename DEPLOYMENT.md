# Deploy to a normal custom domain

**Reserved production domain:** **`paymentswap.net`**. Use **`https://paymentswap.net`** (apex) or **`https://www.paymentswap.net`** as the public site—HTTPS, automated SSL, standard DNS. The constant `RESERVED_PUBLIC_DOMAIN` in `src/lib/config/marketplace.ts` matches this host for code/docs alignment.

---

## 1. Prerequisites

- Repository access (typically GitHub) for the app codebase.
- A **production** Supabase project with migrations applied (`supabase/db push` or SQL in filename order—see README).
- A **Stripe** account (**test** vs **live** keys match the phase you launch).
- DNS control for **`paymentswap.net`** (registrar or Cloudflare, etc.).
- Decide **apex** (`paymentswap.net`) vs **`www`** (or both; pick **one** canonical value for `NEXT_PUBLIC_APP_URL`).

---

## 2. Recommended host: Vercel (Next.js-native)

Most teams treat this like any other SaaS deploy: Git → CI → HTTPS domain.

**Copy‑paste checklist (Vercel env, Stripe webhook URL, Supabase redirects):** from the repo root run **`npm run go-live`** — it reads **`RESERVED_PUBLIC_DOMAIN`** from `src/lib/config/marketplace.ts` (`paymentswap.net` today).

### 2.1 Create the project

1. Sign up / log in at [vercel.com](https://vercel.com/).
2. **Add New Project** → import the Git repository containing this app.
3. Framework: **Next.js** (auto-detected). Root directory: this package if it lives in a monorepo subfolder (**Settings → General → Root Directory**).
4. **Build command**: default `npm run build` is correct.
5. **Install**: `npm ci` is typical for reproducible installs (optional preference in project settings).

### 2.2 Production environment variables

In **Project → Settings → Environment Variables**, add (Production only unless noted):

| Name | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase **Settings → API**. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase **Settings → API** (`anon`, public). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** (`service_role`). Never expose client-side or in previews you don’t trust. |
| `NEXT_PUBLIC_APP_URL` | **`https://paymentswap.net`** (or **`https://www.paymentswap.net`**) — **HTTPS**, **no trailing slash**. Must match the URL users type and your canonical choice. |
| `STRIPE_SECRET_KEY` | Live or test secret per phase. |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the **production webhook** pointing at your domain (see §5). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional until Stripe.js is wired; safe to omit in many flows. |
| `ENABLE_HSTS` *(optional)* | Set to **`1`** on non-Vercel HTTPS hosts so `Strict-Transport-Security` is sent. On Vercel, production deploys enable HSTS automatically when **`VERCEL_ENV=production`**. Leave unset on local/dev. |
| `ALLOW_PUBLIC_ADMIN_SIGNUP` *(optional)* | **`true`** only on staging to expose Admin on `/sign-up`. **Unset in production** (see §3b). |

Redeploy after changing variables (Vercel can trigger automatically).

### 2.3 Attach the domain (what “regular site” means)

1. **Project → Settings → Domains** → add **`paymentswap.net`** (and **`www.paymentswap.net`** if needed).
2. Vercel shows **exact DNS records**. Common patterns:
   - **Apex** (`paymentswap.net`): A records to Vercel’s IPs **or** CNAME flattening at your DNS provider (`ALIAS` / `ANAME`) to `cname.vercel-dns.com` (follow Vercel’s UI for current values).
   - **Subdomain** (`www`): **CNAME** to `cname.vercel-dns.com` (or the hostname Vercel displays).
3. Wait for propagation and SSL: Vercel issues certificates automatically when DNS is correct.

**What to send the client’s IT desk:** “Please add these DNS records exactly as listed in Vercel for **paymentswap.net**.” No tunnels, nothing unusual.

---

## 3. Canonical URL discipline

Pick **one** public URL:

- If marketing uses **www**, set `NEXT_PUBLIC_APP_URL=https://www.paymentswap.net` and in Vercel add a redirect from apex → www (domain settings redirect), **or**
- If apex is canonical, use `https://paymentswap.net`.

Mismatch between `NEXT_PUBLIC_APP_URL` and Stripe/Supabase redirect configuration is a common cause of broken checkout or infinite redirect loops—keep them aligned.

---

## 3b. First ops / admin user (production)

Public sign-up intentionally offers **buyer** and **seller** only unless `ALLOW_PUBLIC_ADMIN_SIGNUP=true` (use for staging). For production admin access:

1. In **Supabase Dashboard → Authentication → Users**, create the user (email invite or insert) **or** sign up as a normal user then promote in SQL.
2. Set **App metadata** or **User metadata** so `role` is `"admin"` (must match JWT `user_metadata.role` used by `/admin` gate)—the app expects `role` alongside the `profiles` row.
3. Ensure **`profiles`** for that UUID has **`role = 'admin'`** (insert/update in SQL Editor if needed).

After promotion, `/admin` behaves like a conventional **staff portal** (`/seller`/`/buyer` remain customer-facing dashboards).

---

## 4. Supabase (Auth + redirects)

In **Supabase Dashboard → Authentication → URL configuration**:

| Setting | Value |
| --- | --- |
| **Site URL** | Same as `NEXT_PUBLIC_APP_URL` (e.g. `https://paymentswap.net`). |
| **Redirect URLs** | Include your app origin patterns, at minimum:<br>`https://paymentswap.net/**`<br>`https://paymentswap.net/*`<br>Add `www` separately if used: `https://www.paymentswap.net/**`<br>For local dev keep `http://localhost:3000/**` in a separate **development** Supabase project or document that previews use staging auth URLs. |

This is normal Supabase SaaS behavior; clients who use Supabase-hosted auth have seen these fields before.

---

## 5. Stripe (payments + Connect)

### 5.1 Webhooks

In **Stripe Dashboard → Developers → Webhooks** (correct mode: **test** or **live**):

- **Endpoint URL**: **`https://paymentswap.net/api/webhooks/stripe`** (or your chosen canonical host, e.g. `www`, if that is what you configured—must match the live site).
- **Events**: at minimum `checkout.session.completed`, `payment_intent.processing`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled` (align with `README` / route comments).

Copy the signing secret → **`STRIPE_WEBHOOK_SECRET`** on Vercel (production).

Local development still uses Stripe CLI forwarding or a staging URL; production uses the domain above—no gimmicks.

### 5.2 Connect / redirects

Stripe Connect onboarding and refresh URLs derive from **`NEXT_PUBLIC_APP_URL`** (see seller payout flows). After moving domain, test **seller onboarding once** before announcing go-live.

---

## 6. Sanity checks before handoff

1. Open **`https://paymentswap.net`** (or your canonical URL) — resolves with padlock (valid cert).
2. **`GET https://paymentswap.net/api/health`** — JSON `checks.core_config` and `checks.payments_pipeline` true in production secrets.
3. Sign in as **buyer / seller / admin** on production (role routes under `/buyer`, `/seller`, `/admin`).
4. **Checkout** smoke test (test mode Stripe first): success and cancel URLs return under your domain.
5. Stripe **Webhook** delivery log shows `200` for test events after payment.

---

## 7. Other hosts (same idea)

If you **don’t** use Vercel, the checklist is unchanged conceptually:

- Run **`npm run build`** + **`npm run start`** on a Node host **or** use the host’s Next.js blueprint.
- Set the **same env vars** in their secrets UI.
- Point DNS at their **load balancer / edge** per their wizard.
- Keep **`NEXT_PUBLIC_APP_URL`** and Supabase/Stripe URLs aligned with **`https://paymentswap.net`** (or your canonical `https` host).

---

## 8. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Redirect loop after sign-in | `NEXT_PUBLIC_APP_URL`, Supabase **Site URL**, or cookie domain mismatch. |
| Stripe checkout exits to localhost | **`NEXT_PUBLIC_APP_URL`** wrong in production env or not redeployed. |
| Webhooks never mark paid | Wrong URL mode (test vs live), wrong secret for that endpoint, or **502** hiding body (check Stripe logs). |
| Images blocked | **`next.config`** `images.remotePatterns` must include production Supabase host (`*.supabase.co` etc.). |

For local development only, continue using **localhost** — this document is for **production** at **paymentswap.net** (or an explicit staging hostname you choose).
