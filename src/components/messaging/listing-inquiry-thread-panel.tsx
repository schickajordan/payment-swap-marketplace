"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { postListingInquiryMessageAction } from "@/app/messaging/listing-inquiry-actions";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

type MessageRow = Database["public"]["Tables"]["thread_messages"]["Row"];

type ListingInquiryThreadPanelProps = {
  listingId: string;
  threadId: string | null;
  messages: MessageRow[];
  returnTo?: string;
  /** Override default PDP copy when shown on seller dashboard */
  heading?: string;
  description?: ReactNode;
};

export function ListingInquiryThreadPanel({
  listingId,
  threadId,
  messages: initialMessages,
  returnTo = `/listings/${listingId}`,
  heading = "Ask before you apply",
  description,
}: ListingInquiryThreadPanelProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!threadId) return;

    const supabase = createClientSupabaseClient();
    const channel = supabase
      .channel(`thread_messages:inquiry:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "thread_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!row?.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [threadId]);

  return (
    <section className="mt-8 rounded-xl border border-gold/20 bg-[#091c3d]/50 p-4 md:p-5" aria-labelledby="inquiry-chat">
      <h2 id="inquiry-chat" className="text-sm font-semibold uppercase tracking-wide text-gold">
        {heading}
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {description ?? (
          <>
            Lightweight marketplace DM—seller sees this inside their dashboard instantly. Serious offers still route
            through <span className="text-slate-300">Apply for swap</span> once you&apos;re ready.
          </>
        )}
      </p>
      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm">
        {messages.length === 0 ?
          <p className="text-slate-400">No messages yet — introduce your crew &amp; timing.</p>
        : messages.map((m) => (
            <div key={m.id} className="rounded border border-white/5 bg-black/25 px-2 py-1.5">
              <p className="text-slate-100">{m.body}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))
        }
        <div ref={bottomRef} />
      </div>
      <form action={postListingInquiryMessageAction} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="listingId" value={listingId} />
        {threadId ? <input type="hidden" name="threadId" value={threadId} /> : null}
        <input type="hidden" name="returnTo" value={returnTo} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Inspectors, lien questions, availability windows…"
          className="rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 text-sm text-white outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="w-fit rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-[#071733] hover:bg-[#ffd14d]"
        >
          Send message
        </button>
      </form>
    </section>
  );
}
