"use client";

import { useEffect, useRef, useState } from "react";
import { postAgreementMessageAction } from "@/app/messaging/actions";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/database.types";

type MessageRow = Database["public"]["Tables"]["thread_messages"]["Row"];

type AgreementThreadPanelProps = {
  agreementId: string;
  threadId: string | null;
  messages: MessageRow[];
  /** Server-validated destinations include /buyer, /seller, /admin, /messages, /listings/:id */
  returnTo: string;
};

export function AgreementThreadPanel({
  agreementId,
  threadId,
  messages: initialMessages,
  returnTo,
}: AgreementThreadPanelProps) {
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!threadId) {
      return;
    }

    const supabase = createClientSupabaseClient();
    const channel = supabase
      .channel(`thread_messages:${threadId}`)
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
            if (prev.some((m) => m.id === row.id)) {
              return prev;
            }
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
    <div className="mt-4 rounded-lg border border-white/10 bg-[#091c3d]/60 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Deal thread</p>
        {threadId ? (
          <p className="text-[10px] text-slate-500">Live updates on</p>
        ) : (
          <p className="text-[10px] text-slate-500">Live updates after the first message</p>
        )}
      </div>
      <div className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
        {messages.length === 0 ? (
          <p className="text-slate-400">No messages yet.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded border border-white/5 bg-black/20 px-2 py-1.5">
              <p className="text-slate-200">{m.body}</p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {new Date(m.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form action={postAgreementMessageAction} className="mt-3 flex flex-col gap-2">
        <input type="hidden" name="agreementId" value={agreementId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Write a message…"
          className="rounded-md border border-white/20 bg-[#071733] px-2 py-1.5 text-sm text-white outline-none focus:border-gold"
        />
        <button
          type="submit"
          className="w-fit rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-[#071733] hover:bg-[#ffd14d]"
        >
          Send
        </button>
      </form>
    </div>
  );
}
