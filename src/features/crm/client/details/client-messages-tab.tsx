"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useEventMessageDrafts } from "../../messages/hooks/use-event-message-drafts";
import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import type { MessageDraft } from "../../messages/types/message-draft";
import type { Translate } from "../../shared/types/form-types";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";
import { ClientEmailComposer } from "./client-email-composer";

const kindKeys = {
  contract: "crm.client.detail.messages.kind.contract",
  general: "crm.client.detail.messages.kind.general",
  invoice: "crm.client.detail.messages.kind.invoice",
  questionnaire: "crm.client.detail.messages.kind.questionnaire",
  quote: "crm.client.detail.messages.kind.quote",
} as const;

const statusKeys = {
  draft: "crm.client.detail.messages.status.draft",
  sent: "crm.client.detail.messages.status.sent",
} as const;

type ClientThread = {
  id: string;
  latest_sender_address: string;
  latest_sender_name: string;
  preview: string;
  subject: string;
};
type ClientMessage = { body_text: string; direction: "inbound" | "outbound"; id: string; message_attachments: { file_name: string; id: string }[]; sender_address: string; sender_name: string; sent_at: string };

export function ClientMessagesTab(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const eventId = client.event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.messages")}>
        <ClientEmailComposer client={client} t={t} />
        <UnifiedClientThreads clientId={client.id} t={t} />
        <p className="text-sm text-zinc-500">{t("crm.client.detail.empty.event")}</p>
      </ClientDetailSection>
    );
  }

  return <MessageList client={client} eventId={eventId} locale={locale} t={t} />;
}

function UnifiedClientThreads({ clientId, t }: { clientId: string; t: Translate }) {
  const [threads, setThreads] = useState<ClientThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [reply, setReply] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [replyStatus, setReplyStatus] = useState<"" | "error" | "sent">("");

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/messages/threads?view=inbox&clientId=${encodeURIComponent(clientId)}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: ClientThread[] }>)
      .then((result) => { if (!controller.signal.aborted) { setThreads(result.data ?? []); setLoading(false); } })
      .catch(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [clientId]);

  useEffect(() => {
    if (!selectedId) return;
    void fetch(`/api/messages/threads/${selectedId}`)
      .then((response) => response.json() as Promise<{ data?: { messages?: ClientMessage[] } }>)
      .then((result) => setMessages(result.data?.messages ?? []));
  }, [selectedId, replyStatus]);

  const sendReply = async () => {
    if (!selectedId || !reply.trim()) return;
    const form = new FormData(); form.set("body", reply); if (file) form.set("file", file);
    const response = await fetch(`/api/messages/threads/${selectedId}/reply`, { body: form, method: "POST" });
    setReplyStatus(response.ok ? "sent" : "error");
    if (response.ok) { setReply(""); setFile(null); }
  };

  return <div className="space-y-3"><h3 className="text-sm font-bold uppercase tracking-wide text-zinc-500">{t("crm.client.detail.tab.messages")}</h3>{loading ? <p className="text-sm text-zinc-500">{t("crm.client.detail.messages.loading")}</p> : null}{!loading && !threads.length ? <p className="text-sm text-zinc-500">{t("crm.client.detail.messages.empty")}</p> : null}{threads.map((thread) => <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={thread.id}><button className="w-full text-left" onClick={() => setSelectedId(selectedId === thread.id ? null : thread.id)} type="button"><p className="font-bold text-zinc-100">{thread.subject || t("messages.composeEmail")}</p><p className="mt-1 text-xs text-cyan-200">{thread.latest_sender_name || thread.latest_sender_address}</p><p className="mt-2 truncate text-sm text-zinc-400">{thread.preview}</p></button>{selectedId === thread.id ? <div className="mt-4 space-y-3 border-t border-zinc-800 pt-4">{messages.map((message) => <article className="rounded border border-zinc-800 p-3" key={message.id}><p className="text-xs font-bold text-cyan-200">{message.sender_name || message.sender_address}</p><p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{message.body_text}</p>{message.message_attachments.map((attachment) => <a className="mt-2 block text-xs text-cyan-200" href={`/api/messages/attachments/${attachment.id}`} key={attachment.id}>{attachment.file_name}</a>)}</article>)}<textarea className="min-h-24 w-full rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setReply(event.target.value)} placeholder={t("messages.replyPlaceholder")} value={reply} /><input className="text-xs text-zinc-400" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" /><div className="flex justify-end"><button className="rounded bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-950" onClick={() => void sendReply()} type="button">{t("messages.send")}</button></div>{replyStatus === "error" ? <p className="text-xs text-rose-300">{t("messages.composeError")}</p> : null}</div> : null}</div>)}</div>;
}

function MessageList(props: Pick<ClientDetailSectionProps, "client" | "locale" | "t"> & {
  eventId: string;
}) {
  const { client, eventId, locale, t } = props;
  const state = useEventMessageDrafts(eventId);
  const mutation = useMessageDraftMutation(eventId);

  const markSent = async (messageId: string) => {
    await mutation.updateStatus(messageId, "sent");
    await state.refresh();
  };

  return (
    <ClientDetailSection title={t("crm.client.detail.tab.messages")}>
      <div className="space-y-5">
        <ClientEmailComposer client={client} t={t} />
        <UnifiedClientThreads clientId={client.id} t={t} />
        {state.isLoading ? <p className="text-sm text-zinc-500">{t("crm.client.detail.messages.loading")}</p> : null}
        {state.hasError ? <p className="text-sm text-rose-300">{t("crm.client.detail.messages.loadError")}</p> : null}
        {!state.isLoading && state.drafts.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.client.detail.messages.empty")}
          </p>
        ) : null}
        {state.drafts.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <Head>{t("crm.client.detail.messages.field.created")}</Head>
                    <Head>{t("crm.client.detail.messages.field.kind")}</Head>
                    <Head>{t("crm.client.detail.messages.field.recipients")}</Head>
                    <Head>{t("crm.client.detail.messages.field.subject")}</Head>
                    <Head>{t("crm.client.detail.messages.field.status")}</Head>
                    <Head alignRight>{t("public.portal.columns.actions")}</Head>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                  {state.drafts.map((draft) => (
                    <tr key={draft.id}>
                      <Cell>{formatDateTime(draft.createdAt, locale)}</Cell>
                      <Cell>{t(kindKeys[draft.documentKind])}</Cell>
                      <Cell>{formatRecipients(draft)}</Cell>
                      <Cell className="max-w-80 truncate">{draft.subject}</Cell>
                      <Cell>
                        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                          {t(statusKeys[draft.status])}
                        </span>
                      </Cell>
                      <Cell alignRight>
                        {draft.status === "draft" ? (
                          <button
                            className="inline-flex h-8 items-center rounded-md border border-zinc-700 px-3 text-xs font-bold text-zinc-200"
                            onClick={() => void markSent(draft.id)}
                            type="button"
                          >
                            {t("crm.client.detail.messages.action.markSent")}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">-</span>
                        )}
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </ClientDetailSection>
  );
}

function formatRecipients(draft: MessageDraft) {
  if (draft.recipients.length === 0) return "-";
  return draft.recipients.map((recipient) => recipient.email).join(", ");
}

function formatDateTime(value: string, locale: "en" | "es") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Head(props: { alignRight?: boolean; children: string }) {
  return (
    <th
      className={[
        "px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500",
        props.alignRight ? "text-right" : "",
      ].join(" ")}
      scope="col"
    >
      {props.children}
    </th>
  );
}

function Cell(props: { alignRight?: boolean; children: ReactNode; className?: string }) {
  return (
    <td
      className={[
        "px-3 py-3 text-zinc-200",
        props.alignRight ? "text-right" : "",
        props.className ?? "",
      ].join(" ")}
    >
      {props.children}
    </td>
  );
}
