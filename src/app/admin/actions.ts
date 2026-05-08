"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { recordAgreementExecutableInCell } from "@/lib/analytics/liquidity-milestones";
import {
  advanceDealCheckpointFromIntake,
  updateAgreementContractMetadata,
  updateAgreementDealCheckpoint,
  updateAgreementStatus,
} from "@/lib/agreements/queries";
import { parseDealCheckpoint } from "@/lib/listings/deal-template";
import { requireRole } from "@/lib/auth/authorization";
import { createAgreementEvent } from "@/lib/events/queries";
import { finalizeSignedAgreementWithSchedule } from "@/lib/payments/schedule";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const CONTRACT_UPLOAD_MAX_BYTES = 26_214_400; /* 25 MiB bucket cap */
const CONTRACT_UPLOAD_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadAgreementContractArtifactAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const label = String(formData.get("artifactLabel") ?? "").trim() || null;
  const raw = formData.get("contractFile");

  if (!agreementId) {
    redirect("/admin?error=Missing agreement id for upload.");
  }
  if (!(raw instanceof File) || raw.size === 0) {
    redirect("/admin?error=Choose a PDF or Word file to upload.");
  }
  if (raw.size > CONTRACT_UPLOAD_MAX_BYTES) {
    redirect("/admin?error=Contract file exceeds 25 MB.");
  }

  const declared = raw.type.trim();
  if (!CONTRACT_UPLOAD_TYPES.has(declared)) {
    redirect("/admin?error=Only PDF and Word documents are accepted for vault uploads.");
  }
  const contentType = declared;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin?error=Session expired—sign in again.");
  }

  const safeStem = raw.name.replace(/[^\w.\-]+/g, "_").slice(0, 160) || "contract";
  const storagePath = `${agreementId}/${randomUUID()}-${safeStem}`;
  const buffer = Buffer.from(await raw.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("agreement-contracts")
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadError) {
    redirect(`/admin?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error: insertError } = await supabase.from("agreement_contract_artifacts").insert({
    agreement_id: agreementId,
    storage_path: storagePath,
    original_filename: raw.name.slice(0, 512),
    content_type: contentType,
    label,
    uploaded_by: user.id,
  });

  if (insertError) {
    await supabase.storage.from("agreement-contracts").remove([storagePath]);
    redirect(`/admin?error=${encodeURIComponent(insertError.message)}`);
  }

  try {
    await createAgreementEvent({
      agreementId,
      eventType: "contract_artifact_uploaded",
      message: `Contract file stored in private vault${label ? ` (${label})` : ""}: ${raw.name}`,
      metadata: { storage_path: storagePath, label },
      isInternal: false,
    });
  } catch {
    /* non-fatal: file is durably stored */
  }

  redirect("/admin?success=contract-artifact-uploaded");
}

export async function approveAgreementAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "");

  if (!agreementId) {
    redirect("/admin?error=Missing agreement id.");
  }

  try {
    await updateAgreementStatus(agreementId, "signed");
    await finalizeSignedAgreementWithSchedule(agreementId);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await recordAgreementExecutableInCell({
      supabase,
      agreementId,
      actorId: user?.id ?? null,
    });

    await advanceDealCheckpointFromIntake(agreementId, "buyer_qualified");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve agreement.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?success=agreement-approved");
}

export async function rejectAgreementAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "");

  if (!agreementId) {
    redirect("/admin?error=Missing agreement id.");
  }

  try {
    await updateAgreementStatus(agreementId, "cancelled");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject agreement.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?success=agreement-rejected");
}

export async function setDealCheckpointAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const rawCheckpoint = String(formData.get("dealCheckpoint") ?? "");

  if (!agreementId) {
    redirect("/admin?error=Missing agreement id.");
  }

  let dealCheckpoint;
  try {
    dealCheckpoint = parseDealCheckpoint(rawCheckpoint);
  } catch {
    redirect("/admin?error=Invalid deal checkpoint.");
  }

  try {
    await updateAgreementDealCheckpoint(agreementId, dealCheckpoint);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update checkpoint.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?success=deal-checkpoint-updated");
}

export async function postAdminInternalNoteAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!agreementId || !note) {
    redirect("/admin?error=Internal note requires agreement and note text.");
  }

  try {
    await createAgreementEvent({
      agreementId,
      eventType: "admin_internal_note",
      message: note,
      isInternal: true,
      metadata: { source: "admin_dashboard" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save internal note.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?success=internal-note-saved");
}

export async function setAgreementContractAction(formData: FormData) {
  await requireRole(["admin"]);
  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const contractVersion = String(formData.get("contractVersion") ?? "").trim();
  const contractStatus = String(formData.get("contractStatus") ?? "").trim();
  const signedContractUrlRaw = String(formData.get("signedContractUrl") ?? "").trim();

  if (!agreementId || !contractVersion || !contractStatus) {
    redirect("/admin?error=Contract update requires agreement id, version, and status.");
  }

  if (!["draft", "uploaded", "executed"].includes(contractStatus)) {
    redirect("/admin?error=Invalid contract status.");
  }

  if (signedContractUrlRaw && !/^https?:\/\//i.test(signedContractUrlRaw)) {
    redirect("/admin?error=Signed contract URL must start with http or https.");
  }

  try {
    await updateAgreementContractMetadata(agreementId, {
      contractVersion,
      contractStatus: contractStatus as "draft" | "uploaded" | "executed",
      signedContractUrl: signedContractUrlRaw.length > 0 ? signedContractUrlRaw : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update contract metadata.";
    redirect(`/admin?error=${encodeURIComponent(message)}`);
  }

  redirect("/admin?success=contract-metadata-updated");
}
