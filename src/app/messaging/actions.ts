"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/authorization";
import { appendReturnQueryParam } from "@/lib/messaging/append-return-query";
import { ensureMessageThreadForAgreement, postThreadMessage } from "@/lib/messaging/queries";
import { appRoutes, authRoutes } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedReturnPaths = ["/buyer", "/seller", "/admin", authRoutes.messages] as const;

function isSafeMessagesDeepLink(trimmed: string): boolean {
  const u = trimmed.trim();
  if (!u.startsWith(authRoutes.messages)) return false;
  const qsPart = u.slice(authRoutes.messages.length);
  if (!qsPart.startsWith("?")) return false;

  let sp: URLSearchParams;
  try {
    sp = new URLSearchParams(qsPart.startsWith("?") ? qsPart.slice(1) : qsPart);
  } catch {
    return false;
  }

  const keys = [...new Set(sp.keys())];
  if (keys.length !== 1) return false;

  const uuid = /^[0-9a-f-]{36}$/i;

  if (keys[0] === "agreement") return uuid.test(sp.get("agreement") ?? "");
  if (keys[0] === "inquiry") return uuid.test(sp.get("inquiry") ?? "");
  return false;
}

function safeReturnTo(value: string) {
  const trimmed = value.trim();
  if (allowedReturnPaths.includes(trimmed as (typeof allowedReturnPaths)[number])) return trimmed;
  if (isSafeMessagesDeepLink(trimmed)) return trimmed;
  if (trimmed.startsWith("/listings/")) return trimmed;
  return "/buyer";
}

export async function postAgreementMessageAction(formData: FormData) {
  await requireRole(["buyer", "seller", "admin"]);

  const agreementId = String(formData.get("agreementId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/buyer"));

  if (!agreementId) {
    redirect(appendReturnQueryParam(returnTo, "error", "Missing agreement."));
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(authRoutes.signIn);
  }

  const { data: agreement, error: agreementError } = await supabase
    .from("payment_agreements")
    .select("id, buyer_id, seller_id")
    .eq("id", agreementId)
    .single();

  if (agreementError || !agreement) {
    redirect(appendReturnQueryParam(returnTo, "error", "Agreement not found."));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isParticipant =
    agreement.buyer_id === user.id || agreement.seller_id === user.id;

  if (!isParticipant && !isAdmin) {
    redirect(appRoutes.unauthorized);
  }

  const { data: threadRow } = await supabase
    .from("message_threads")
    .select("id")
    .eq("agreement_id", agreementId)
    .maybeSingle();

  const threadId =
    threadRow?.id ?? (await ensureMessageThreadForAgreement(agreementId, user.id)).id;

  try {
    await postThreadMessage(threadId, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message.";
    redirect(appendReturnQueryParam(returnTo, "error", message));
  }

  redirect(appendReturnQueryParam(returnTo, "success", "message-sent"));
}
