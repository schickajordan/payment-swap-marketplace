import { dealCheckpointLabel } from "@/lib/listings/deal-template";
import { authRoutes } from "@/lib/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database } from "@/lib/supabase/database.types";

type ThreadRow = Database["public"]["Tables"]["message_threads"]["Row"];
type AgreementRow = Database["public"]["Tables"]["payment_agreements"]["Row"];
export type MessageRow = Database["public"]["Tables"]["thread_messages"]["Row"];

export type AgreementMessagingShell = {
  agreementId: string;
  threadId: string | null;
  messages: MessageRow[];
  status: AgreementRow["status"];
  deal_checkpoint: AgreementRow["deal_checkpoint"];
};

export async function getAgreementMessagingShellIfViewer(
  agreementId: string
): Promise<AgreementMessagingShell | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: row, error } = await supabase
    .from("payment_agreements")
    .select("id, status, deal_checkpoint")
    .eq("id", agreementId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .maybeSingle();

  if (error || !row) return null;

  const bundle = (await getThreadsWithMessagesByAgreementIds([agreementId])).get(agreementId);

  return {
    agreementId,
    threadId: bundle?.thread.id ?? null,
    messages: bundle?.messages ?? [],
    status: row.status,
    deal_checkpoint: row.deal_checkpoint,
  };
}

export type ListingInquiryMessagingShell = {
  listingId: string;
  threadId: string;
  messages: MessageRow[];
  viewer: "buyer" | "seller";
};

export async function getListingInquiryMessagingShellIfViewer(
  threadId: string
): Promise<ListingInquiryMessagingShell | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: thread, error } = await supabase
    .from("message_threads")
    .select("id, listing_id, inquiry_buyer_id, agreement_id")
    .eq("id", threadId)
    .maybeSingle();

  if (
    error ||
    !thread?.listing_id ||
    thread.agreement_id !== null ||
    !thread.inquiry_buyer_id
  ) {
    return null;
  }

  const isBuyer = thread.inquiry_buyer_id === user.id;
  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id")
    .eq("id", thread.listing_id)
    .maybeSingle();

  const isSeller = listing?.seller_id === user.id;
  if (!isBuyer && !isSeller) return null;

  const bundle = (await getThreadsWithMessagesByThreadIds([threadId])).get(threadId);

  return {
    listingId: thread.listing_id,
    threadId: thread.id,
    messages: bundle?.messages ?? [],
    viewer: isSeller ? "seller" : "buyer",
  };
}

export async function ensureMessageThreadForAgreement(
  agreementId: string,
  createdByUserId: string
): Promise<ThreadRow> {
  const supabase = await createServerSupabaseClient();

  const { data: existing, error: findError } = await supabase
    .from("message_threads")
    .select("*")
    .eq("agreement_id", agreementId)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to look up message thread: ${findError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("message_threads")
    .insert({
      agreement_id: agreementId,
      listing_id: null,
      inquiry_buyer_id: null,
      created_by: createdByUserId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create message thread: ${error.message}`);
  }

  return data;
}

/** Pre-application thread: one row per listing + inquiry buyer. */
export async function ensureListingInquiryThread(
  listingId: string,
  buyerUserId: string
): Promise<ThreadRow> {
  const supabase = await createServerSupabaseClient();

  const { data: existing, error: findError } = await supabase
    .from("message_threads")
    .select("*")
    .eq("listing_id", listingId)
    .eq("inquiry_buyer_id", buyerUserId)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to look up inquiry thread: ${findError.message}`);
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("message_threads")
    .insert({
      agreement_id: null,
      listing_id: listingId,
      inquiry_buyer_id: buyerUserId,
      created_by: buyerUserId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create inquiry thread: ${error.message}`);
  }

  return data;
}

export async function getMessagesForThread(threadId: string): Promise<MessageRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("thread_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load messages: ${error.message}`);
  }

  return data ?? [];
}

export async function getThreadsWithMessagesByThreadIds(
  threadIds: string[]
): Promise<Map<string, { thread: ThreadRow; messages: MessageRow[] }>> {
  const map = new Map<string, { thread: ThreadRow; messages: MessageRow[] }>();
  if (threadIds.length === 0) return map;

  const supabase = await createServerSupabaseClient();
  const { data: threads, error: threadsError } = await supabase
    .from("message_threads")
    .select("*")
    .in("id", threadIds);

  if (threadsError) {
    throw new Error(`Failed to load threads: ${threadsError.message}`);
  }

  const { data: messages, error: messagesError } = await supabase
    .from("thread_messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(`Failed to load messages: ${messagesError.message}`);
  }

  const byThread = new Map<string, MessageRow[]>();
  for (const m of messages ?? []) {
    const list = byThread.get(m.thread_id) ?? [];
    list.push(m);
    byThread.set(m.thread_id, list);
  }

  for (const thread of threads ?? []) {
    map.set(thread.id, { thread, messages: byThread.get(thread.id) ?? [] });
  }

  return map;
}

export async function postThreadMessage(threadId: string, body: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to send a message.");
  }

  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Message cannot be empty.");
  }

  const { error } = await supabase.from("thread_messages").insert({
    thread_id: threadId,
    sender_id: user.id,
    body: trimmed,
  });

  if (error) {
    throw new Error(`Failed to post message: ${error.message}`);
  }
}

export async function getThreadsWithMessagesByAgreementIds(
  agreementIds: string[]
): Promise<Map<string, { thread: ThreadRow; messages: MessageRow[] }>> {
  const map = new Map<string, { thread: ThreadRow; messages: MessageRow[] }>();

  if (agreementIds.length === 0) {
    return map;
  }

  const supabase = await createServerSupabaseClient();
  const { data: threads, error: threadsError } = await supabase
    .from("message_threads")
    .select("*")
    .in("agreement_id", agreementIds);

  if (threadsError) {
    throw new Error(`Failed to load threads: ${threadsError.message}`);
  }

  if (!threads?.length) {
    return map;
  }

  const threadIds = threads.map((t) => t.id);
  const { data: messages, error: messagesError } = await supabase
    .from("thread_messages")
    .select("*")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(`Failed to load messages: ${messagesError.message}`);
  }

  const byThread = new Map<string, MessageRow[]>();
  for (const m of messages ?? []) {
    const list = byThread.get(m.thread_id) ?? [];
    list.push(m);
    byThread.set(m.thread_id, list);
  }

  for (const thread of threads) {
    if (thread.agreement_id) {
      map.set(thread.agreement_id, {
        thread,
        messages: byThread.get(thread.id) ?? [],
      });
    }
  }

  return map;
}

export type UnifiedInboxItem = {
  kind: "agreement" | "listing_inquiry";
  threadId: string;
  agreementId?: string;
  listingId?: string;
  title: string;
  subtitle: string;
  href: string;
  lastPreview: string;
  lastActivity: string;
};

function lastMessageMeta(messages: MessageRow[]): { preview: string; at: string } {
  const last = messages[messages.length - 1];
  if (!last) {
    return { preview: "No messages yet.", at: "" };
  }
  return {
    preview: last.body.length > 120 ? `${last.body.slice(0, 117)}…` : last.body,
    at: last.created_at,
  };
}

/** One screen for buyer, seller, and admin-facing threads (deal + inquiry). */
export async function getUnifiedMessageInbox(): Promise<UnifiedInboxItem[]> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const [{ data: buyerAgreements }, { data: sellerAgreements }] = await Promise.all([
    supabase.from("payment_agreements").select("id, listing_id, deal_checkpoint").eq("buyer_id", user.id),
    supabase.from("payment_agreements").select("id, listing_id, deal_checkpoint").eq("seller_id", user.id),
  ]);

  const agreementRows = [...(buyerAgreements ?? []), ...(sellerAgreements ?? [])];
  const uniqueAgreementIds = [...new Set(agreementRows.map((r) => r.id))];

  const listingIdsForTitles = [...new Set(agreementRows.map((r) => r.listing_id))];
  const { data: listingTitles } =
    listingIdsForTitles.length > 0 ?
      await supabase.from("listings").select("id, title").in("id", listingIdsForTitles)
    : { data: [] as { id: string; title: string }[] };

  const listingTitleById = new Map((listingTitles ?? []).map((l) => [l.id, l.title]));

  const checkpointByAgreementId = new Map<string, AgreementRow["deal_checkpoint"]>();
  for (const r of agreementRows) {
    if (!checkpointByAgreementId.has(r.id)) {
      checkpointByAgreementId.set(r.id, r.deal_checkpoint);
    }
  }

  const agreementBundles = await getThreadsWithMessagesByAgreementIds(uniqueAgreementIds);
  const items: UnifiedInboxItem[] = [];

  for (const agId of uniqueAgreementIds) {
    const row = agreementRows.find((r) => r.id === agId);
    const title = listingTitleById.get(row?.listing_id ?? "") ?? "Equipment deal";
    const bundle = agreementBundles.get(agId);
    const messages = bundle?.messages ?? [];
    const { preview, at } = lastMessageMeta(messages);
    const cp = checkpointByAgreementId.get(agId);
    const cpLabel = cp ? dealCheckpointLabel(cp) : "";
    const roleLine = buyerAgreements?.some((b) => b.id === agId)
      ? "Your purchase application"
      : "Buyer conversation";
    const subtitle = cpLabel ? `${roleLine} · ${cpLabel}` : roleLine;

    items.push({
      kind: "agreement",
      threadId: bundle?.thread.id ?? "",
      agreementId: agId,
      title,
      subtitle,
      href: `${authRoutes.messages}?agreement=${encodeURIComponent(agId)}`,
      lastPreview: preview,
      lastActivity: at,
    });
  }

  const [{ data: buyerInquiryThreads }, { data: myListingIds }] = await Promise.all([
    supabase.from("message_threads").select("id, listing_id").eq("inquiry_buyer_id", user.id).not("listing_id", "is", null),
    supabase.from("listings").select("id").eq("seller_id", user.id),
  ]);

  const ownedListingIds = new Set((myListingIds ?? []).map((l) => l.id));

  const { data: sellerInquiryThreads } = await supabase
    .from("message_threads")
    .select("id, listing_id, inquiry_buyer_id")
    .not("listing_id", "is", null);

  const sellerThreads = (sellerInquiryThreads ?? []).filter(
    (t) => t.listing_id && ownedListingIds.has(t.listing_id)
  );

  const inquiryThreadIds = [
    ...(buyerInquiryThreads ?? []).map((t) => t.id),
    ...sellerThreads.map((t) => t.id),
  ];
  const uniqueInquiryIds = [...new Set(inquiryThreadIds)];
  const inquiryBundles =
    uniqueInquiryIds.length > 0 ?
      await getThreadsWithMessagesByThreadIds(uniqueInquiryIds)
    : new Map();

  const inquiryListingIds = [...new Set([...(buyerInquiryThreads ?? []), ...sellerThreads].map((t) => t.listing_id).filter(Boolean) as string[])];

  const { data: inquiryListings } =
    inquiryListingIds.length > 0 ?
      await supabase.from("listings").select("id, title").in("id", inquiryListingIds)
    : { data: [] as { id: string; title: string }[] };

  const inqTitle = new Map((inquiryListings ?? []).map((l) => [l.id, l.title]));

  for (const row of buyerInquiryThreads ?? []) {
    if (!row.listing_id) continue;
    const bundle = inquiryBundles.get(row.id);
    const messages = bundle?.messages ?? [];
    const { preview, at } = lastMessageMeta(messages);
    items.push({
      kind: "listing_inquiry",
      threadId: row.id,
      listingId: row.listing_id,
      title: inqTitle.get(row.listing_id) ?? "Listing inquiry",
      subtitle: "Pre-application questions",
      href: `${authRoutes.messages}?inquiry=${encodeURIComponent(row.id)}`,
      lastPreview: preview,
      lastActivity: at,
    });
  }

  for (const row of sellerThreads) {
    if (!row.listing_id || !row.inquiry_buyer_id) continue;
    // Avoid duplicate rows if seller is also inquiry buyer on own listing — impossible policy
    const bundle = inquiryBundles.get(row.id);
    const messages = bundle?.messages ?? [];
    const { preview, at } = lastMessageMeta(messages);
    const buyerShort = `${row.inquiry_buyer_id.slice(0, 8)}…`;
    items.push({
      kind: "listing_inquiry",
      threadId: row.id,
      listingId: row.listing_id,
      title: inqTitle.get(row.listing_id) ?? "Buyer inquiry",
      subtitle: `Buyer ${buyerShort}`,
      href: `${authRoutes.messages}?inquiry=${encodeURIComponent(row.id)}`,
      lastPreview: preview,
      lastActivity: at,
    });
  }

  items.sort((a, b) => {
    const ta = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
    const tb = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
    return tb - ta;
  });

  const uniq: UnifiedInboxItem[] = [];
  const dedupeKeys = new Set<string>();

  for (const row of items) {
    const key =
      row.kind === "agreement" ?
        `ag:${row.agreementId ?? row.threadId}`
      : `in:${row.threadId}`;

    if (dedupeKeys.has(key)) continue;
    dedupeKeys.add(key);
    uniq.push(row);
  }

  return uniq;
}
