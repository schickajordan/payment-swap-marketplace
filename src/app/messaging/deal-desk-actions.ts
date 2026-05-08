"use server";

import { redirect } from "next/navigation";
import { createAgreementEvent } from "@/lib/events/queries";
import { authRoutes } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const VAULT_SIGN_SECONDS = 180;

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

  return { user, agr, supabase };
}

/** Opens vault object (specific or latest-first) or external URL; writes `contract_link_opened` audit. */
export async function logContractOpenAction(formData: FormData) {
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const sourceKind = String(formData.get("sourceKind") ?? "auto").trim();
  const artifactId = String(formData.get("artifactId") ?? "").trim();

  if (!agreementId) {
    redirect(`${authRoutes.messages}?error=${encodeURIComponent("Missing agreement.")}`);
  }

  const { agr, supabase } = await assertAgreementParty(agreementId);

  async function auditAndRedirect(targetUrl: string, metadata: Record<string, unknown>) {
    await createAgreementEvent({
      agreementId,
      eventType: "contract_link_opened",
      message: "Party opened a contract document (access logged).",
      metadata: { source: "deal_desk", ...metadata },
    });
    redirect(targetUrl);
  }

  if (sourceKind === "external") {
    const target = agr.signed_contract_url?.trim();
    if (!target) {
      redirect(
        `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent("No external contract URL on file.")}`,
      );
    }
    await auditAndRedirect(target, { channel: "external_url" });
  }

  if (artifactId) {
    const { data: art, error: artErr } = await supabase
      .from("agreement_contract_artifacts")
      .select("id, storage_path")
      .eq("id", artifactId)
      .eq("agreement_id", agreementId)
      .maybeSingle();

    if (artErr || !art?.storage_path) {
      redirect(
        `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent("That contract revision was not found.")}`,
      );
    }

    const { data: signed, error: signErr } = await supabase.storage
      .from("agreement-contracts")
      .createSignedUrl(art.storage_path, VAULT_SIGN_SECONDS);

    if (signErr || !signed?.signedUrl) {
      redirect(
        `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent(signErr?.message ?? "Could not sign download link.")}`,
      );
    }

    await auditAndRedirect(signed.signedUrl, {
      channel: "storage_vault",
      artifact_id: art.id,
      storage_path: art.storage_path,
    });
  }

  const { data: latestList, error: listErr } = await supabase
    .from("agreement_contract_artifacts")
    .select("id, storage_path")
    .eq("agreement_id", agreementId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latest = latestList?.[0];
  if (!listErr && latest?.storage_path) {
    const { data: signed, error: signErr } = await supabase.storage
      .from("agreement-contracts")
      .createSignedUrl(latest.storage_path, VAULT_SIGN_SECONDS);

    if (!signErr && signed?.signedUrl) {
      await auditAndRedirect(signed.signedUrl, {
        channel: "storage_vault",
        artifact_id: latest.id,
        storage_path: latest.storage_path,
        selection: "latest",
      });
    }
  }

  const external = agr.signed_contract_url?.trim();
  if (sourceKind === "auto" && external) {
    await auditAndRedirect(external, { channel: "external_url", selection: "fallback" });
  }

  redirect(
    `${authRoutes.messages}?agreement=${encodeURIComponent(agreementId)}&error=${encodeURIComponent("No vault file or external link on file yet.")}`,
  );
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
