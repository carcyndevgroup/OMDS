"use client";

import { useEffect, useState } from "react";

import { useEmailTemplateOptions } from "@/features/crm/messages/hooks/use-email-template-options";

import type { Translate } from "../components/lead-form-types";
import type { Lead } from "../types/lead";

type LeadMessageThread = {
  id: string;
  latest_sender_address: string;
  latest_sender_name: string;
  preview: string;
  subject: string;
  last_message_at: string;
};

type Props = { lead: Lead; t: Translate };
type Draft = { body: string; subject: string; templateKey: string; to: string };

export function LeadMessages({ lead, t }: Props) {
  const { options: templates } = useEmailTemplateOptions("general");
  const leadId = lead.id;
  const [threads, setThreads] = useState<LeadMessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [to, setTo] = useState(lead.email);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [status, setStatus] = useState<"" | "error" | "sent" | "draft">("");

  useEffect(() => {
    const saved = localStorage.getItem(`omds-lead-email-draft-${lead.id}`);
    if (saved) { try { const draft = JSON.parse(saved) as Draft; setTo(draft.to); setSubject(draft.subject); setBody(draft.body); setTemplateKey(draft.templateKey); } catch { /* Ignore malformed local drafts. */ } }
  }, [lead.id]);

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

  const chooseTemplate = (key: string) => {
    const template = templates.find((item) => item.templateKey === key);
    setTemplateKey(key);
    if (template) { setSubject(template.subject); setBody(template.body); }
  };
  const saveDraft = () => { localStorage.setItem(`omds-lead-email-draft-${lead.id}`, JSON.stringify({ body, subject, templateKey, to } satisfies Draft)); setStatus("draft"); };
  const send = async () => {
    setStatus("");
    const form = new FormData(); form.set("leadId", lead.id); form.set("to", to); form.set("subject", subject); form.set("body", body);
    const response = await fetch("/api/messages/compose", { body: form, method: "POST" });
    if (!response.ok) { setStatus("error"); return; }
    localStorage.removeItem(`omds-lead-email-draft-${lead.id}`); setStatus("sent"); setIsComposing(false); setSubject(""); setBody(""); setTemplateKey("");
  };

  if (isLoading) return <p className="text-sm text-zinc-500">{t("crm.lead.detail.loading")}</p>;
  if (!threads.length) return <p className="text-sm text-zinc-400">{t("crm.lead.detail.empty.messages")}</p>;

  return <div className="space-y-4"><div className="flex justify-end"><button className="rounded bg-cyan-300 px-3 py-2 text-sm font-bold text-zinc-950" onClick={() => setIsComposing(true)} type="button">{t("messages.composeEmail")}</button></div>{isComposing ? <section className="rounded-md border border-cyan-300/30 bg-zinc-950 p-4"><div className="grid gap-3"><input className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setTo(event.target.value)} placeholder={t("messages.recipient")} value={to} /><select className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => chooseTemplate(event.target.value)} value={templateKey}><option value="">{t("messages.template")}</option>{templates.map((template) => <option key={template.templateKey} value={template.templateKey}>{template.title}</option>)}</select><input className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setSubject(event.target.value)} placeholder={t("messages.subject")} value={subject} />{isPreview ? <div className="min-h-48 rounded bg-white p-5 text-sm text-zinc-900"><h3 className="mb-4 text-lg font-bold">{subject}</h3><p className="whitespace-pre-wrap">{body}</p></div> : <textarea className="min-h-48 rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setBody(event.target.value)} placeholder={t("messages.composePlaceholder")} value={body} />}</div><div className="mt-3 flex justify-end gap-2"><button className="rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300" onClick={() => setIsPreview(!isPreview)} type="button">{isPreview ? t("messages.edit") : t("messages.preview")}</button><button className="rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300" onClick={saveDraft} type="button">{t("messages.saveDraft")}</button><button className="rounded bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-950 disabled:opacity-50" disabled={!to.trim() || !subject.trim() || !body.trim()} onClick={() => void send()} type="button">{t("messages.send")}</button></div>{status === "draft" ? <p className="mt-2 text-xs text-amber-300">{t("messages.draftSaved")}</p> : status === "sent" ? <p className="mt-2 text-xs text-emerald-300">{t("messages.replySent")}</p> : status === "error" ? <p className="mt-2 text-xs text-rose-300">{t("messages.composeError")}</p> : null}</section> : null}<div className="space-y-2">{threads.map((thread) => <a className="block rounded-md border border-zinc-800 bg-zinc-950 p-4 transition hover:border-cyan-300/60" href={`/messages?thread=${thread.id}`} key={thread.id}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{thread.subject || t("messages.noSubject")}</p><p className="mt-1 truncate text-xs text-cyan-200">{thread.latest_sender_name || thread.latest_sender_address}</p></div><time className="shrink-0 text-xs text-zinc-500">{new Date(thread.last_message_at).toLocaleDateString()}</time></div><p className="mt-2 truncate text-sm text-zinc-400">{thread.preview}</p></a>)}</div></div>;
}