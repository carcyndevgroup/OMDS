"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { LeadForm } from "@/features/crm/lead/components/lead-form";
import { useTranslation } from "@/core/i18n";

export default function NewLeadPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-900 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-7 sm:px-6 lg:px-8">
          <Link
            aria-label={t("crm.lead.action.back")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={22} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-normal text-white sm:text-4xl">
              {t("crm.lead.page.title")}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <p className="mb-6 max-w-3xl text-sm leading-6 text-zinc-400">
          {t("crm.lead.page.subtitle")}
        </p>
        <LeadForm />
      </div>
    </main>
  );
}
