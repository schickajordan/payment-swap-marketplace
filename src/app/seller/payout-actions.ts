"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { createOrGetStripeConnectOnboardingLink } from "@/lib/payouts/queries";

export async function connectStripePayoutAction() {
  await requireRole(["seller", "admin"]);

  try {
    const url = await createOrGetStripeConnectOnboardingLink("/seller");
    redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to launch Stripe onboarding.";
    redirect(`/seller?error=${encodeURIComponent(message)}`);
  }
}
