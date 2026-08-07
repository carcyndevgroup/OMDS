"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Facebook, Instagram, Mail, Music2 } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

const channels = [
  { provider: "email", icon: Mail, titleKey: "settings.messages.email.title", bodyKey: "settings.messages.email.body", fallbackStatusKey: "settings.messages.status.planned" },
  { provider: "instagram", icon: Instagram, titleKey: "settings.messages.instagram.title", bodyKey: "settings.messages.instagram.body", fallbackStatusKey: "settings.messages.status.credentials" },
  { provider: "facebook", icon: Facebook, titleKey: "settings.messages.facebook.title", bodyKey: "settings.messages.facebook.body", fallbackStatusKey: "settings.messages.status.credentials" },
  { provider: "tiktok", icon: Music2, titleKey: "settings.messages.tiktok.title", bodyKey: "settings.messages.tiktok.body", fallbackStatusKey: "settings.messages.status.credentials" },
] as const;

type Connection = { provider: string; status: string; address: string | null };

export function MessageConnectionsPage() {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    void fetch("/api/messages/connections")
      .then((response) => response.ok ? response.json() as Promise<{ data?: Connection[] }> : null)
      .then((result) => setConnections(result?.data ?? []));
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-cyan-200" href="/settings"><ArrowLeft size={16} />{t("settings.messages.back")}</Link>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{t("settings.messages.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-bold">{t("settings.messages.title")}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">{t("settings.messages.subtitle")}</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          {channels.map(({ provider, icon: Icon, titleKey, bodyKey, fallbackStatusKey }) => {
            const connection = connections.find((item) => item.provider === provider);
            const statusKey = connection?.status === "connected" ? "settings.messages.status.connected" : fallbackStatusKey;
            return (
            <article className="rounded-md border border-zinc-800 bg-zinc-900 p-5" key={titleKey}>
              <div className="flex items-start justify-between gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-300/15 text-cyan-200"><Icon size={22} /></span><span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300"><CheckCircle2 size={14} />{t(statusKey)}</span></div>
              <h2 className="mt-5 text-xl font-bold">{t(titleKey)}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{connection?.address ?? t(bodyKey)}</p>
            </article>
            );
          })}
        </section>
        <section className="rounded-md border border-cyan-300/20 bg-cyan-300/5 p-5">
          <h2 className="text-lg font-bold text-cyan-100">{t("settings.messages.metaChecklist.title")}</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
            <li>{t("settings.messages.metaChecklist.business")}</li>
            <li>{t("settings.messages.metaChecklist.app")}</li>
            <li>{t("settings.messages.metaChecklist.pages")}</li>
            <li>{t("settings.messages.metaChecklist.webhook")}</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
