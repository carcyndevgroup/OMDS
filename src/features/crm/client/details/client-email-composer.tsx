"use client";

import { useEffect, useState } from "react";

import { useEmailTemplateOptions } from "../../messages/hooks/use-email-template-options";
import type { Translate } from "../../shared/types/form-types";
import type { ClientDetail } from "../types/client";

type Props = { client: ClientDetail; t: Translate };
type Draft = { body: string; recipient: string; subject: string; template_key: string };

export function ClientEmailComposer({ client, t }: Props) {
  const { options: templates } = useEmailTemplateOptions("general");
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [to, setTo] = useState(client.email);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [status, setStatus] = useState<"" | "error" | "draft" | "sent">("");

  useEffect(() => {
    void fetch(`/api/messages/drafts?clientId=${encodeURIComponent(client.id)}`)
      .then((response) => response.ok ? response.json() as Promise<{ data?: Draft }> : null)
      .then((result) => { if (result?.data) { setTo(result.data.recipient); setSubject(result.data.subject); setBody(result.data.body); setTemplateKey(result.data.template_key); } })
      .catch(() => undefined);
  }, [client.id]);

  const selectTemplate = (key: string) => {
    const template = templates.find((option) => option.templateKey === key);
    setTemplateKey(key);
    if (template) { setSubject(template.subject); setBody(template.body); }
  };

  const saveDraft = async () => {
    const response = await fetch("/api/messages/drafts", { body: JSON.stringify({ body, clientId: client.id, subject, templateKey, to }), headers: { "Content-Type": "application/json" }, method: "PUT" });
    setStatus(response.ok ? "draft" : "error");
  };

  const send = async () => {
    setStatus("");
    const form = new FormData();
    form.set("clientId", client.id); form.set("to", to); form.set("subject", subject); form.set("body", body);
    const response = await fetch("/api/messages/compose", { body: form, method: "POST" });
    if (!response.ok) { setStatus("error"); return; }
    await fetch(`/api/messages/drafts?clientId=${encodeURIComponent(client.id)}`, { method: "DELETE" });
    setStatus("sent"); setOpen(false); setSubject(""); setBody(""); setTemplateKey("");
  };

  return <div className="space-y-3"><div className="flex justify-end"><button className="rounded bg-cyan-300 px-3 py-2 text-sm font-bold text-zinc-950" onClick={() => setOpen(true)} type="button">{t("messages.composeEmail")}</button></div>{open ? <section className="rounded-md border border-cyan-300/30 bg-zinc-950 p-4"><div className="grid gap-3"><input className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setTo(event.target.value)} placeholder={t("messages.recipient")} value={to} /><select className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => selectTemplate(event.target.value)} value={templateKey}><option value="">{t("messages.template")}</option>{templates.map((template) => <option key={template.templateKey} value={template.templateKey}>{template.title}</option>)}</select><input className="rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setSubject(event.target.value)} placeholder={t("messages.subject")} value={subject} />{preview ? <div className="min-h-48 rounded bg-white p-5 text-sm text-zinc-900"><h3 className="mb-4 text-lg font-bold">{subject}</h3><p className="whitespace-pre-wrap">{body}</p></div> : <textarea className="min-h-48 rounded border border-zinc-800 bg-zinc-900 p-2 text-sm text-zinc-200" onChange={(event) => setBody(event.target.value)} placeholder={t("messages.composePlaceholder")} value={body} />}</div><div className="mt-3 flex justify-end gap-2"><button className="rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300" onClick={() => setPreview(!preview)} type="button">{preview ? t("messages.edit") : t("messages.preview")}</button><button className="rounded border border-zinc-700 px-3 py-2 text-xs text-zinc-300" onClick={() => void saveDraft()} type="button">{t("messages.saveDraft")}</button><button className="rounded bg-cyan-300 px-3 py-2 text-xs font-bold text-zinc-950" onClick={() => void send()} type="button">{t("messages.send")}</button></div>{status === "draft" ? <p className="mt-3 text-xs text-emerald-300">{t("messages.draftSaved")}</p> : null}{status === "sent" ? <p className="mt-3 text-xs text-emerald-300">{t("messages.replySent")}</p> : null}{status === "error" ? <p className="mt-3 text-xs text-rose-300">{t("messages.composeError")}</p> : null}</section> : null}</div>;
}