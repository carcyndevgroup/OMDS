"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";
import { ClientForm } from "@/features/crm/client/components/client-form";

export default function NewClientPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center gap-3">
          <Link
            aria-label={t("crm.lead.action.back")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            href="/crm/leads"
          >
            <ArrowLeft aria-hidden="true" size={21} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {t("crm.client.page.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              {t("crm.client.page.subtitle")}
            </p>
          </div>
        </header>
        <ClientForm />
      </div>
    </main>
  );
}
