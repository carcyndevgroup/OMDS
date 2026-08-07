"use client";

import { Archive, Inbox, Link2, Mail, Menu, Paperclip, RefreshCw, Search, Send, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { CrmLookupField } from "./crm-lookup-field";
import { StaffLookupField } from "./staff-lookup-field";

type Thread = {
  id: string;
  provider: string;
  subject: string;
  preview: string;
  last_message_at: string;
  unread_count: number;
  is_starred: boolean;
  labels: string[];
  lead_id: string | null;
  client_id: string | null;
  event_id: string | null;
  assigned_to: string | null;
  is_archived: boolean;
};

type Message = {
  message_attachments?: { file_name: string; id: string }[];
  body_text: string;
  direction: "inbound" | "outbound";
  id: string;
  sender_name: string;
  sent_at: string;
};

type View = "archived" | "inbox" | "starred" | "unread";

const viewLabels: Record<View, TranslationKey> = {
  archived: "messages.view.archived",
  inbox: "messages.view.inbox",
  starred: "messages.view.starred",
  unread: "messages.view.unread",
};

const providerLabel = (provider: string) => provider === "email" ? "Email" : provider;

export function MessageInbox() {
  const { t } = useTranslation();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [view, setView] = useState<View>("inbox");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<"saved" | "error" | "">("");
  const [crmLeadId, setCrmLeadId] = useState("");
  const [crmClientId, setCrmClientId] = useState("");
  const [crmEventId, setCrmEventId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"" | "error" | "loading" | "success">("");

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    const params = new URLSearchParams({ view });
    if (query.trim()) params.set("q", query.trim());
    void fetch(`/api/messages/threads?${params}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: Thread[] }>)
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
  }, [query, refreshKey, view]);

  const selected = threads.find((thread) => thread.id === selectedId) ?? threads[0];

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      setCrmLeadId("");
      setCrmClientId("");
      setCrmEventId("");
      setAssignedTo("");
      setIsStarred(false);
      setIsArchived(false);
      return;
    }
    setCrmLeadId(selected.lead_id ?? "");
    setCrmClientId(selected.client_id ?? "");
    setCrmEventId(selected.event_id ?? "");
    setAssignedTo(selected.assigned_to ?? "");
    setIsStarred(selected.is_starred);
    setIsArchived(selected.is_archived);
    const controller = new AbortController();
    void fetch(`/api/messages/threads/${selected.id}`, { signal: controller.signal })
      .then((response) => response.json() as Promise<{ data?: { messages?: Message[] } }>)
      .then((result) => {
        if (!controller.signal.aborted) setMessages(result.data?.messages ?? []);
      })
      .catch(() => undefined);
    void fetch(`/api/messages/threads/${selected.id}`, { method: "PATCH" });
    return () => controller.abort();
  }, [selected?.id]);

  const saveThreadLinks = async () => {
    if (!selected) return;
    await fetch(`/api/messages/threads/${selected.id}`, {
      body: JSON.stringify({
        assignedTo: assignedTo || null,
        clientId: crmClientId || null,
        eventId: crmEventId || null,
        isArchived,
        isStarred,
        leadId: crmLeadId || null,
      }),
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
    });
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setIsSending(true);
    setReplyStatus("");
    const response = await fetch(`/api/messages/threads/${selected.id}/reply`, {
      body: JSON.stringify({ body: reply }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (response.ok) {
      const result = (await response.json()) as { data: Message };
      setMessages((current) => [...current, result.data]);
      if (attachment) {
        const form = new FormData();
        form.set("messageId", result.data.id);
        form.set("file", attachment);
        await fetch(`/api/messages/threads/${selected.id}/attachments`, { body: form, method: "POST" });
      }
      setReply("");
      setAttachment(null);
      setReplyStatus("saved");
    } else {
      setReplyStatus("error");
    }
    setIsSending(false);
  };

  const syncMailbox = async () => {
    setSyncStatus("loading");
    try {
      const response = await fetch("/api/messages/sync", { method: "POST" });
      if (!response.ok) {
        setSyncStatus("error");
        return;
      }
      setSyncStatus("success");
      setRefreshKey((current) => current + 1);
    } catch {
      setSyncStatus("error");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/20">
      <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-900/70 p-4">
        <button className="mb-5 flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-bold text-zinc-950">
          <Mail aria-hidden="true" size={16} /> {t("messages.compose")}
        </button>
        <button className="mb-5 flex w-full items-center justify-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-cyan-300 hover:text-cyan-200" disabled={syncStatus === "loading"} onClick={() => void syncMailbox()} type="button">
          <RefreshCw aria-hidden="true" className={syncStatus === "loading" ? "animate-spin" : ""} size={16} /> {t(syncStatus === "loading" ? "messages.syncing" : "messages.sync")}
        </button>
        {syncStatus === "success" ? <p className="mb-4 text-xs text-emerald-300">{t("messages.syncComplete")}</p> : syncStatus === "error" ? <p className="mb-4 text-xs text-rose-300">{t("messages.syncError")}</p> : null}
        <nav className="space-y-1">
          {(["inbox", "unread", "starred", "archived"] as View[]).map((item) => (
            <button className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm ${view === item ? "bg-cyan-300/10 text-cyan-200" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`} key={item} onClick={() => setView(item)}>
              {item === "inbox" ? <Inbox size={16} /> : item === "unread" ? <Mail size={16} /> : item === "starred" ? <Star size={16} /> : <Archive size={16} />}
              {t(viewLabels[item])}
            </button>
          ))}
        </nav>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <Menu aria-hidden="true" className="text-zinc-500" size={18} />
          <div className="flex flex-1 items-center gap-2 rounded-md bg-zinc-900 px-3 py-2">
            <Search aria-hidden="true" className="text-zinc-500" size={16} />
            <input className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600" onChange={(event) => setQuery(event.target.value)} placeholder={t("messages.search")} value={query} />
          </div>
          <button className="rounded p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white" title={t("messages.send") }><Send size={17} /></button>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="w-[min(34rem,48%)] min-w-[18rem] overflow-y-auto border-r border-zinc-800">
            {isLoading ? <p className="p-6 text-sm text-zinc-500">{t("messages.loading")}</p> : threads.length === 0 ? <p className="p-6 text-sm text-zinc-500">{t("messages.empty")}</p> : threads.map((thread) => (
              <button className={`block w-full border-b border-zinc-800/80 px-4 py-3 text-left hover:bg-zinc-900 ${selected?.id === thread.id ? "bg-cyan-300/5" : ""}`} key={thread.id} onClick={() => setSelectedId(thread.id)}>
                <div className="flex items-center justify-between gap-3">
                  <span className={`truncate text-sm ${thread.unread_count > 0 ? "font-bold text-white" : "text-zinc-300"}`}>{providerLabel(thread.provider)}</span>
                  <time className="shrink-0 text-[11px] text-zinc-600">{new Date(thread.last_message_at).toLocaleDateString()}</time>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-zinc-200">{thread.subject || t("messages.noSubject")}</p>
                <p className="mt-1 truncate text-xs text-zinc-500">{thread.preview}</p>
              </button>
            ))}
          </div>
          <article className="hidden min-w-0 flex-1 p-6 md:block">
            {selected ? <>
              <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                <div><p className="text-xs uppercase tracking-wider text-cyan-300">{providerLabel(selected.provider)}</p><h1 className="mt-1 text-xl font-bold text-white">{selected.subject || t("messages.noSubject")}</h1></div>
                <button className="rounded p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white" title={t("messages.attachments")}><Paperclip size={17} /></button>
              </div>
              <div className="border-b border-zinc-800 py-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500"><Link2 size={14} />{t("messages.crmLinks")}</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <CrmLookupField labelKey="messages.leadId" onChange={setCrmLeadId} t={t} type="leads" value={crmLeadId} />
                  <CrmLookupField labelKey="messages.clientId" onChange={setCrmClientId} t={t} type="clients" value={crmClientId} />
                  <CrmLookupField labelKey="messages.eventId" onChange={setCrmEventId} t={t} type="events" value={crmEventId} />
                  <StaffLookupField onChange={setAssignedTo} t={t} value={assignedTo} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3"><div className="flex gap-3 text-xs text-zinc-400"><label><input checked={isStarred} onChange={(event) => setIsStarred(event.target.checked)} type="checkbox" /> {t("messages.starred")}</label><label><input checked={isArchived} onChange={(event) => setIsArchived(event.target.checked)} type="checkbox" /> {t("messages.archived")}</label></div><button className="rounded bg-cyan-300 px-3 py-1.5 text-xs font-bold text-zinc-950" onClick={() => void saveThreadLinks()}>{t("messages.saveLinks")}</button></div>
              </div>
              <div className="space-y-4 py-6">
                {messages.length === 0 ? <p className="text-sm text-zinc-500">{t("messages.noMessages")}</p> : messages.map((message) => (
                  <div className={`max-w-[85%] rounded-md border border-zinc-800 p-3 ${message.direction === "outbound" ? "ml-auto bg-cyan-300/10" : "bg-zinc-900"}`} key={message.id}>
                    <div className="flex justify-between gap-4 text-xs text-zinc-500"><span>{message.sender_name || t("messages.unknownSender")}</span><time>{new Date(message.sent_at).toLocaleString()}</time></div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{message.body_text}</p>
                    {message.message_attachments?.length ? <div className="mt-3 space-y-1 border-t border-zinc-700 pt-2">{message.message_attachments.map((file) => <a className="block text-xs font-semibold text-cyan-300 hover:text-cyan-100" href={`/api/messages/attachments/${file.id}`} key={file.id} rel="noreferrer" target="_blank">{file.file_name}</a>)}</div> : null}
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <textarea className="min-h-24 w-full resize-y rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-200 outline-none focus:border-cyan-300" onChange={(event) => setReply(event.target.value)} placeholder={t("messages.replyPlaceholder")} value={reply} />
                <div className="mt-2 flex items-center justify-between gap-3"><label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200"><Paperclip size={15} />{attachment?.name ?? t("messages.attachFile")}<input className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0] ?? null)} type="file" /></label><button className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50" disabled={!reply.trim() || isSending} onClick={() => void sendReply()}><Send size={15} />{isSending ? t("messages.sending") : t("messages.reply")}</button></div>
                {replyStatus ? <p className={`mt-2 text-xs ${replyStatus === "error" ? "text-red-300" : "text-amber-300"}`}>{t(replyStatus === "error" ? "messages.replyError" : "messages.replySavedPendingDelivery")}</p> : null}
              </div>
            </> : <p className="text-sm text-zinc-500">{t("messages.selectThread")}</p>}
          </article>
        </div>
      </section>
    </div>
  );
}
