"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useTranslation } from "@/core/i18n";

type RecordItem = { id: string; label: string };

export function DataCleanupPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<RecordItem[]>([]);
  const [leads, setLeads] = useState<RecordItem[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    void Promise.all([
      fetch("/api/crm/clients").then((response) => response.json()),
      fetch("/api/crm/leads").then((response) => response.json()),
    ]).then(([clientPayload, leadPayload]) => {
      setClients((clientPayload.data ?? []).map((item: { id: string; firstName: string; lastName: string; email: string }) => ({ id: item.id, label: `${item.firstName} ${item.lastName} (${item.email})` })));
      setLeads((leadPayload.data ?? []).map((item: { id: string; name: string; email: string }) => ({ id: item.id, label: `${item.name} (${item.email})` })));
    });
  }, []);

  const toggle = (setter: (value: (current: string[]) => string[]) => void, id: string) => setter((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const purge = async (purgeAll: boolean) => {
    setStatus("loading");
    const response = await fetch("/api/settings/data-cleanup", { body: JSON.stringify({ clientIds: selectedClients, confirmation, leadIds: selectedLeads, purgeAll }), headers: { "Content-Type": "application/json" }, method: "POST" });
    setStatus(response.ok ? "success" : "error");
    if (response.ok) window.location.reload();
  };

  return <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl space-y-5"><Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings"><ArrowLeft size={18} />{t("settings.dataCleanup.back")}</Link><header><h1 className="text-3xl font-bold">{t("settings.dataCleanup.title")}</h1><p className="mt-2 text-sm text-zinc-400">{t("settings.dataCleanup.subtitle")}</p></header><section className="rounded-md border border-rose-500/40 bg-rose-950/20 p-5"><p className="font-bold text-rose-200">{t("settings.dataCleanup.warning")}</p><div className="mt-5 grid gap-5 md:grid-cols-2">{[[t("settings.dataCleanup.clients"), clients, selectedClients, setSelectedClients], [t("settings.dataCleanup.leads"), leads, selectedLeads, setSelectedLeads]].map(([title, items, selected, setter]) => <div key={title as string}><h2 className="mb-2 font-bold">{title as string}</h2><div className="max-h-64 space-y-2 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3">{(items as RecordItem[]).map((item) => <label className="flex gap-2 text-sm text-zinc-300" key={item.id}><input checked={(selected as string[]).includes(item.id)} onChange={() => toggle(setter as (value: (current: string[]) => string[]) => void, item.id)} type="checkbox" />{item.label}</label>)}</div></div>)}</div><input className="mt-5 h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm" onChange={(event) => setConfirmation(event.target.value)} placeholder={t("settings.dataCleanup.confirmationPlaceholder")} value={confirmation} /><div className="mt-4 flex flex-wrap gap-3"><button className="inline-flex h-11 items-center gap-2 rounded-md bg-rose-500 px-4 text-sm font-bold text-white disabled:opacity-50" disabled={status === "loading"} onClick={() => void purge(false)} type="button"><Trash2 size={16} />{t("settings.dataCleanup.purgeSelected")}</button><button className="h-11 rounded-md border border-rose-500 px-4 text-sm font-bold text-rose-200 disabled:opacity-50" disabled={status === "loading"} onClick={() => void purge(true)} type="button">{t("settings.dataCleanup.purgeAll")}</button></div>{status === "success" ? <p className="mt-3 text-sm text-emerald-300">{t("settings.dataCleanup.success")}</p> : null}{status === "error" ? <p className="mt-3 text-sm text-rose-300">{t("settings.dataCleanup.error")}</p> : null}</section></div></main>;
}