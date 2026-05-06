"use server";

import { redirect } from "next/navigation";
import { appendReturnQueryParam } from "@/lib/messaging/append-return-query";
import { ensureListingInquiryThread, postThreadMessage } from "@/lib/messaging/queries";
import { authRoutes, signInUrlWithNext } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const listingPath = /^\/listings\/[0-9a-f-]{36}$/i;

const inquiryReturnWhitelist = new Set(["/seller", authRoutes.messages, "/buyer"]);

function safeListingReturn(path: string, listingId: string) {
  const q = path.indexOf("?");
  const base = q === -1 ? path : path.slice(0, q);
  const suffix = q === -1 ? "" : path.slice(q);

  if (listingPath.test(base)) return `${base}${suffix}`;
  if (inquiryReturnWhitelist.has(base)) return `${base}${suffix}`;
  return `/listings/${listingId}`;
}

export async function postListingInquiryMessageAction(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "").trim();
  const threadId = String(formData.get("threadId") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const returnTo = safeListingReturn(
    String(formData.get("returnTo") ?? `/listings/${listingId}`),
    listingId
  );

  if (!listingId) {
    redirect("/marketplace");
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(signInUrlWithNext(`/listings/${listingId}`));
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .single();

  if (error || !listing) {
    redirect(appendReturnQueryParam(returnTo, "error", "Listing not available."));
  }

  if (listing.seller_id === user.id) {
    if (!threadId) {
      redirect(appendReturnQueryParam(returnTo, "error", "Missing conversation."));
    }
    const { data: inquiryThread, error: threadErr } = await supabase
      .from("message_threads")
      .select("id, listing_id, inquiry_buyer_id, agreement_id")
      .eq("id", threadId)
      .maybeSingle();

    if (
      threadErr ||
      !inquiryThread ||
      inquiryThread.listing_id !== listingId ||
      inquiryThread.agreement_id !== null ||
      !inquiryThread.inquiry_buyer_id
    ) {
      redirect(appendReturnQueryParam(returnTo, "error", "Invalid inquiry thread."));
    }

    await postThreadMessage(inquiryThread.id, body);
    redirect(appendReturnQueryParam(returnTo, "message", "inquiry-sent"));
  }

  if (listing.status !== "active") {
    redirect(appendReturnQueryParam(returnTo, "error", "Listing not available."));
  }

  const thread = await ensureListingInquiryThread(listing.id, user.id);
  await postThreadMessage(thread.id, body);

  redirect(appendReturnQueryParam(returnTo, "message", "inquiry-sent"));
}
