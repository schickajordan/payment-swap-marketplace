import Link from "next/link";
import { redirect } from "next/navigation";
import {
  changePasswordLoggedInAction,
  deleteAccountAction,
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
  updateNotificationPrefsAction,
  updateProfileBasicsAction,
} from "@/app/account/actions";
import { signInWithGoogleAction } from "@/app/(auth)/actions";
import { AccountMfaPanel } from "@/components/account/account-mfa-panel";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { getCurrentSession } from "@/lib/auth/session";
import { listMyAddresses, getMyProfileRow } from "@/lib/profiles/queries";
import { getMyPayoutAccount } from "@/lib/payouts/queries";
import { APP_NAME } from "@/lib/config/marketplace";
import { MARKETPLACE_DEAL_LANE_ENTRIES } from "@/lib/marketplace/deal-lanes";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";

type AccountPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

const successMessages: Record<string, string> = {
  "profile-saved": "Profile saved.",
  "notifications-saved": "Notification preferences saved.",
  "password-changed": "Password updated.",
  "address-saved": "Address saved.",
  "address-deleted": "Address deleted.",
  "address-default": "Default address updated.",
  "stripe-onboarding-complete":
    "Stripe onboarding was updated. Payout status below should refresh within a moment.",
};

/** Allowlisted slug shape only; unknown keys still get a generic line (no raw echo). */
const ACCOUNT_SUCCESS_KEY = /^[a-z0-9-]{1,64}$/;

function accountSuccessMessage(success: string | undefined): string | null {
  if (!success) return null;
  const mapped = successMessages[success];
  if (mapped) return mapped;
  if (ACCOUNT_SUCCESS_KEY.test(success)) return "Saved successfully.";
  return null;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { user, role } = await getCurrentSession();
  if (!user) {
    redirect(signInUrlWithNext(authRoutes.account));
  }

  const [profile, addresses, payoutAccount, sp] = await Promise.all([
    getMyProfileRow(),
    listMyAddresses(),
    getMyPayoutAccount(),
    searchParams,
  ]);

  if (!profile) {
    redirect(signInUrlWithNext(authRoutes.account));
  }

  const successBanner = accountSuccessMessage(sp.success);

  const providers = [...new Set(user.identities?.map((i) => i.provider) ?? [])];
  const primaryEmail = typeof user.email === "string" ? user.email : "";

  return (
    <MarketingShell>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 md:px-8 md:py-12">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Account hub</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">Your account</h1>
          <p className="text-sm text-slate-400">
            {APP_NAME} mirrors the Amazon / Uber / Turo playbook: self-serve profile, security, saved addresses, email
            prefs, and payouts status in one place.
          </p>
        </header>

        {sp.error ?
          <p className="mt-6 rounded-md border border-red-300/40 bg-red-500/10 p-3 text-sm text-red-200">
            {sp.error}
          </p>
        : null}
        {successBanner ?
          <p className="mt-6 rounded-md border border-emerald-300/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {successBanner}
          </p>
        : null}

        <section
          aria-label="Marketplace swap lane shortcuts"
          className="mt-8 rounded-xl border border-white/10 bg-[#091c3d]/45 p-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Shop a swap lane</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Jump to inventory filtered by the deal template—same presets as the marketplace sidebar.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {MARKETPLACE_DEAL_LANE_ENTRIES.map((lane) => (
              <Link
                key={lane.deal}
                href={lane.href}
                className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-gold/40 hover:text-gold"
              >
                {lane.compactLabel}
              </Link>
            ))}
            <Link
              href="/marketplace"
              className="rounded-md border border-gold/30 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10"
            >
              All inventory
            </Link>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Sign-in methods</h2>
            <p className="mt-1 text-xs text-slate-500">
              Connected today: {providers.length > 0 ? providers.join(", ") : "email/password only"}.
            </p>
            <form action={signInWithGoogleAction} className="mt-3">
              <input type="hidden" name="next" value={authRoutes.account} />
              <button
                type="submit"
                className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/10"
              >
                Continue with Google
              </button>
              <p className="mt-2 text-[11px] text-slate-500">
                Requires Google provider enabled in Supabase Dashboard → Authentication → Providers.
              </p>
            </form>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Trust &amp; verification flags</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full border px-2 py-1 ${
                  profile.is_identity_verified ? "border-emerald-400/50 text-emerald-200" : "border-white/20 text-slate-400"
                }`}
              >
                Identity {profile.is_identity_verified ? "verified" : "not verified"}
              </span>
              <span
                className={`rounded-full border px-2 py-1 ${
                  profile.is_business_verified ?
                    "border-emerald-400/50 text-emerald-200"
                  : "border-white/20 text-slate-400"
                }`}
              >
                Business {profile.is_business_verified ? "verified" : "not verified"}
              </span>
              <span className="rounded-full border border-white/20 px-2 py-1 text-slate-300">
                Stripe payouts {payoutAccount?.onboarding_complete ? "ready" : "not connected"}
              </span>
              <span className="rounded-full border border-white/20 px-2 py-1 text-slate-400">
                Account role · {role}
              </span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Verification badges are flipped by ops + Stripe onboarding—not by this UI. Sellers should finish Connect
              in the{" "}
              <Link href="/seller" className="text-gold hover:underline">
                seller dashboard
              </Link>
              .
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Profile</h2>
            <form action={updateProfileBasicsAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-slate-200 md:col-span-2">
                Full name
                <input
                  name="full_name"
                  defaultValue={profile.full_name ?? ""}
                  className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
                  placeholder="Pat Example"
                  maxLength={200}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-200 md:col-span-2">
                Company
                <input
                  name="company_name"
                  defaultValue={profile.company_name ?? ""}
                  className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
                  placeholder="Fleet or shop legal name"
                  maxLength={200}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-200 md:col-span-2">
                Phone (recovery + ops contact)
                <input
                  name="phone"
                  defaultValue={profile.phone ?? ""}
                  type="tel"
                  className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
                  placeholder="+1 ..."
                  maxLength={40}
                />
              </label>
              <p className="text-[11px] text-slate-500 md:col-span-2">
                SMS OTP is configurable in Supabase if you enable the phone provider—this field stores your business
                line for humans to reach you.
              </p>
              <button
                type="submit"
                className="md:col-span-2 w-fit rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
              >
                Save profile
              </button>
            </form>
          </section>

          <AccountMfaPanel />

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Password</h2>
            <p className="mt-1 text-xs text-slate-500">
              Re-validates against your existing password server-side—same UX as retailer account centers.
            </p>
            <form action={changePasswordLoggedInAction} className="mt-4 grid max-w-lg gap-3">
              <label className="flex flex-col gap-1 text-sm text-slate-200">
                Current password
                <input
                  name="current_password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-200">
                New password
                <input
                  name="new_password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="rounded-md border border-white/20 bg-[#091c3d] px-3 py-2 text-white outline-none focus:border-gold"
                />
              </label>
              <button
                type="submit"
                className="w-fit rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Update password
              </button>
              <Link href={authRoutes.forgotPassword} className="text-xs font-semibold text-gold hover:underline">
                Forgot password · email me a recovery link instead
              </Link>
            </form>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Email preferences</h2>
            <p className="mt-1 text-xs text-slate-500">
              Honest transactional defaults on; marketing off until you flip it—we still send auth + legal notices via
              Supabase.
            </p>
            <form action={updateNotificationPrefsAction} className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  name="notify_transactions"
                  defaultChecked={profile.notify_email_transactions ?? true}
                  className="h-4 w-4 accent-gold"
                />
                Payments &amp; escrow updates
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  name="notify_messages"
                  defaultChecked={profile.notify_email_messages ?? true}
                  className="h-4 w-4 accent-gold"
                />
                Deal + inquiry chatter digests (when templated email ships)
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  name="notify_marketing"
                  defaultChecked={profile.notify_email_marketing ?? false}
                  className="h-4 w-4 accent-gold"
                />
                Product &amp; marketplace tips
              </label>
              <button
                type="submit"
                className="rounded-md bg-gold/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gold hover:bg-gold/30"
              >
                Save email preferences
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Saved addresses</h2>
              <span className="text-[11px] text-slate-500">Used by buyers/sellers during checkout workflows</span>
            </div>
            <div className="mt-4 space-y-4">
              {addresses.length === 0 ?
                <p className="text-sm text-slate-400">None yet — add HQ or the yard receiving wire transfers.</p>
              : addresses.map((a) => (
                  <article
                    key={a.id}
                    className="rounded-lg border border-white/10 bg-[#091c3d]/40 px-3 py-2 text-sm text-slate-200"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{a.label}</p>
                        {a.is_default ?
                          <p className="text-[11px] uppercase tracking-wide text-gold">Default</p>
                        : null}
                        <p>{a.line1}</p>
                        {a.line2 ?
                          <p>{a.line2}</p>
                        : null}
                        <p className="text-slate-300">
                          {[a.city, a.region, a.postal_code].filter(Boolean).join(", ")}
                        </p>
                        <p>{a.country_code}</p>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide">
                        {!a.is_default ?
                          <form action={setDefaultAddressAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <button type="submit" className="text-gold hover:text-[#ffd14d]">
                              Make default
                            </button>
                          </form>
                        : null}
                        <form action={deleteAddressAction}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-red-300 hover:text-red-200">
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                ))
              }
            </div>
            <form action={saveAddressAction} className="mt-6 grid gap-2 border-t border-white/10 pt-4 md:grid-cols-2">
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400 md:col-span-2">
                Label
                <input
                  name="label"
                  placeholder="Billing / HQ / Yard"
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400 md:col-span-2">
                Line 1
                <input
                  name="line1"
                  required
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400 md:col-span-2">
                Line 2 (optional)
                <input
                  name="line2"
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                City
                <input
                  name="city"
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                Region / state
                <input name="region" className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold" />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                Postal code
                <input
                  name="postal_code"
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 normal-case text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex flex-col text-xs uppercase tracking-wide text-slate-400">
                Country code
                <input
                  name="country_code"
                  defaultValue="US"
                  maxLength={2}
                  className="mt-1 rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 uppercase text-white outline-none focus:border-gold"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 md:col-span-2">
                <input type="checkbox" name="is_default" className="h-4 w-4 accent-gold" />
                Make default billing / fulfillment address
              </label>
              <button
                type="submit"
                className="md:col-span-2 w-fit rounded-md bg-gold px-4 py-2 text-sm font-semibold text-[#071733] hover:bg-[#ffd14d]"
              >
                Save address
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Payment methods</h2>
            <p className="mt-3 text-sm text-slate-300">
              Buyers authenticate each Stripe Checkout session with the card/bank pulled at payment time—we do not stash
              raw PAN server-side yet. Sellers manage payout bank accounts through Connect onboarding above.
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-card p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gold">Privacy &amp; closure</h2>
            <p className="mt-2 text-sm text-slate-300">
              Need CSV exports (GDPR / DSAR)? Email support—automated bundles land on the backlog once agreements +
              payouts join a single exporter.
            </p>
            <form action={deleteAccountAction} className="mt-6 max-w-lg border-t border-red-900/40 pt-6">
              <p className="text-sm font-semibold text-red-200">Danger zone · delete forever</p>
              <p className="mt-2 text-xs text-slate-500">
                Type <span className="font-semibold text-white">{primaryEmail}</span> to purge auth + cascading profile +
                marketplace rows.
              </p>
              <label className="mt-4 flex flex-col gap-1 text-sm text-red-100">
                Confirm email
                <input
                  name="confirm_email"
                  autoComplete="off"
                  placeholder={primaryEmail}
                  className="rounded-md border border-red-900/60 bg-black/60 px-3 py-2 text-white outline-none focus:border-red-400"
                  required
                />
              </label>
              <button
                type="submit"
                className="mt-4 rounded-md border border-red-500/60 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-red-100 hover:bg-red-900/40"
              >
                Permanently delete account
              </button>
            </form>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
