"use server";

import { redirect } from "next/navigation";
import { createAgreementEvent } from "@/lib/events/queries";
import { authRoutes } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function assertAgreementParty(agreementId: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${authRoutes.signIn}?next=${encodeURIComponent(authRoutes.messages)}`);
  }

  const { data: agr } = await supabase
    .from("payment_agreements")
    .select("buyer_id, seller_id, signed_contract_url")
    .eq("id", agreementId)
    .maybeSingle();

  if (!agr || (agr.buyer_id !== user.id && agr.seller_id !== user.id)) {
    redirect(`${authRoutes.messages}?error=${encodeURIComponent("You cannot access this agreement.")}`);
  }

  return { user, agr };
}

export async function logContractOpenAction(formData: FormData) {
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  if (!agreementId) {
    redirect(`${authRoutes.messages}?error=${encodeURIComponent("Missing agreement.")}`);
  }

  const { agr } = await assertAgreementParty(agreementId);
  const target = agr.signed_contract_url?.trim();
  if (!target) {
    redirect(
      `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent("No executed contract URL on file yet.")}`,
    );
  }

  await createAgreementEvent({
    agreementId,
    eventType: "contract_link_opened",
    message: "Party opened the executed contract link (access logged).",
    metadata: { source: "deal_desk" },
  });

  redirect(target);
}

export async function submitDisputeNoteAction(formData: FormData) {
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!agreementId) {
    redirect(`${authRoutes.messages}?error=${encodeURIComponent("Missing agreement.")}`);
  }

  await assertAgreementParty(agreementId);

  if (body.length < 8) {
    redirect(
      `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent("Add at least 8 characters describing the payment or paperwork issue.")}`,
    );
  }

  await createAgreementEvent({
    agreementId,
    eventType: "dispute_escalation",
    message: body.slice(0, 4000),
    metadata: { source: "deal_desk" },
  });

  redirect(`${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&success=dispute-logged`);
}
