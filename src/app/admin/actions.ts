"use server";

import { redirect } from "next/navigation";
import { recordAgreementExecutableInCell } from "@/lib/analytics/liquidity-milestones";
import {
  advanceDealCheckpointFromIntake,
  updateAgreementDealCheckpoint,
  updateAgreementStatus,
} from "@/lib/agreements/queries";
import { parseDealCheckpoint } from "@/lib/listings/deal-template";
import { requireRole } from "@/lib/auth/authorization";
import { createAgreementEvent } from "@/lib/events/queries";
import { finalizeSignedAgreementWithSchedule } from "@/lib/payments/schedule";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
