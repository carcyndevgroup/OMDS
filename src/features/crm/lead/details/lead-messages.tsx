"use client";

import { useEffect, useState } from "react";

import type { Translate } from "../components/lead-form-types";

type LeadMessageThread = {
  id: string;
  latest_sender_address: string;
  latest_sender_name: string;
  preview: string;
  subject: string;
  last_message_at: string;
};

type Props = { leadId: string; t: Translate };

export function LeadMessages({ leadId, t }: Props) {
  const [threads, setThreads] = useState<LeadMessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/messages/threads?view=inbox&leadId=${encodeURIComponent(leadId)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: LeadMessageThread[] }>)
      .then((result) => {
        if (!controller.signal.aborted) {
          setThreads(result.data ?? []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [leadId]);

  if (isLoading) return <p className="text-sm text-zinc-500">{t("crm.lead.detail.loading")}</p>;
  if (!threads.length) return <p className="text-sm text-zinc-400">{t("crm.lead.detail.empty.messages")}</p>;

  return <div className="space-y-2">{threads.map((thread) => <a className="block rounded-md border border-zinc-800 bg-zinc-950 p-4 transition hover:border-cyan-300/60" href={`/messages?thread=${thread.id}`} key={thread.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{thread.subject || t("messages.noSubject")}</p><p className="mt-1 truncate text-xs text-cyan-200">{thread.latest_sender_name || thread.latest_sender_address}</p></div><time className="shrink-0 text-xs text-zinc-500">{new Date(thread.last_message_at).toLocaleDateString()}</time></div><p className="mt-2 truncate text-sm text-zinc-400">{thread.preview}</p></a>)}</div>;
}