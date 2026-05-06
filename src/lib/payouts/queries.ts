import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe/server";

export async function getMyPayoutAccount() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("seller_payout_accounts")
    .select("*")
    .eq("seller_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load payout account: ${error.message}`);
  }

  return data;
}

export async function createOrGetStripeConnectOnboardingLink(returnPath = "/seller") {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to configure payouts.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripeServerClient();

  const { data: existing } = await supabase
    .from("seller_payout_accounts")
    .select("*")
    .eq("seller_id", user.id)
    .maybeSingle();

  let accountId = existing?.stripe_account_id ?? null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      business_type: "individual",
      metadata: {
        seller_user_id: user.id,
      },
    });
    accountId = account.id;
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/seller?error=stripe-refresh-required`,
    return_url: `${appUrl}${returnPath}?success=stripe-onboarding-complete`,
    type: "account_onboarding",
  });

  const account = await stripe.accounts.retrieve(accountId);

  const { error } = await supabase.from("seller_payout_accounts").upsert(
    {
      seller_id: user.id,
      stripe_account_id: accountId,
      onboarding_complete: account.details_submitted && account.charges_enabled,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: "seller_id" }
  );

  if (error) {
    throw new Error(`Failed to save payout account: ${error.message}`);
  }

  return accountLink.url;
}
