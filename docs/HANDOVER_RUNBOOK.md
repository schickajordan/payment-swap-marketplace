# Payment Swap Marketplace Handover Runbook

## Purpose

This runbook is for production handover to operations, product, and engineering stakeholders.

## Production URLs

- Main site: `https://www.paymentswapmp.com`
- Help & support: `https://www.paymentswapmp.com/support`
- Product tour / demo entry: `https://www.paymentswapmp.com/demo`
- Admin dashboard: `https://www.paymentswapmp.com/admin`
- Health endpoint: `https://www.paymentswapmp.com/api/health`
- Security contact file: `https://www.paymentswapmp.com/.well-known/security.txt` (update the mailto if needed).

## Enterprise / procurement expectations

This application can be **operationally hardened**, but **FAANG-style procurement** normally requires evidence the codebase cannot generate by itself:

| Area | In-repo / automated today | Typically required for large enterprises |
|------|---------------------------|------------------------------------------|
| Dependency hygiene | CI runs `npm run audit:prod` (production tree, high+) before build | Plus SDLC policy, approved exception process |
| Transport security | HSTS on Vercel production (`next.config.ts`) | TLS inventory, cert rotation, sometimes mTLS at edge |
| Roles / admin | `profiles.role`, documented in this runbook | SSO (SAML), SCIM, SIEM export — product work |
| Payments | Stripe Connect integration | Stripe platform agreement, MTL/legal, disputes program |
| Assessments | — | Annual pen test, SOC 2 Type II, privacy reviews |

**Honest positioning:** ship strong engineering practice + docs + health gates; sell attestations and legal review as follow-on tranches.

## Core Workflows

### Registration and account setup

1. User signs up at `/sign-up`.
2. User confirms email with Supabase.
3. User signs in and profile is provisioned.
4. Legal acceptance is enforced for protected routes.

### Seller listing and media

1. Seller creates listing from `/seller`.
2. Seller uploads media from `/seller/listings/[id]/media`.
3. Listing enters review queue and can be approved/rejected by admin.

### Agreement lifecycle

1. Buyer applies to an active listing.
2. Draft agreement enters admin queue.
3. Admin sets checkpoint and contract governance fields.
4. Admin approval marks agreement `signed` and generates payment schedule.
5. Agreement status/checkpoints/events continue through active servicing.

## Contract Governance (Admin)

Each agreement should include:

- `contract_version` (for example `v1`, `v1.1`)
- `contract_status` (`draft`, `uploaded`, `executed`)
- `signed_contract_url` when available
- upload/execution timestamps (system-managed)

Operational rule: do not move to `executed` until a valid contract URL is attached and legal review is complete.

## Launch Checklist

- `npm run verify:full` (production `npm audit` high+ + proxy check + lint + typecheck + build)
- or individually: `npm run audit:prod`, `npm run lint`, `npm run typecheck`, `npm run build`
- `npm run test:e2e` (if browser env available)
- Verify `/api/health` reports expected checks
- Verify latest commit header on prod:
  - `curl -sI https://www.paymentswapmp.com/ | rg x-psm-deploy-commit -i`

## Access and Roles

- Buyer dashboard: `/buyer`
- Seller dashboard: `/seller`
- Admin dashboard: `/admin` (admin role required)

If role access fails, validate `profiles.role` in Supabase and re-authenticate.

## Incident Basics

1. Confirm health endpoint and current deploy commit.
2. Check Stripe webhook event table for processing errors.
3. Validate Supabase env and auth state.
4. Roll forward with a fix and redeploy production.
