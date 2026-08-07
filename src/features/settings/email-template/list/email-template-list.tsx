"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useEmailTemplateList } from "../hooks/use-email-template-list";
import { useEmailTemplateMutation } from "../hooks/use-email-template-mutation";
import { EmailTemplateListCard } from "./email-template-list-card";

export function EmailTemplateList() {
  const { t } = useTranslation();
  const state = useEmailTemplateList();
  const mutation = useEmailTemplateMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setPendingId(id);
    try {
      await mutation.setActive(id, !isActive);
      await state.refresh();
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setPendingId(id);
    try {
      await mutation.remove(id);
      await state.refresh();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      const message =
        code === "default_template_delete_forbidden"
          ? t("settings.emailTemplate.action.deleteDefaultError")
          : code === "template_in_use_delete_forbidden"
            ? t("settings.emailTemplate.action.deleteInUseError")
          : t("settings.emailTemplate.action.deleteError");
      window.alert(message);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex items-center justify-between gap-4">
          <div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/settings">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("settings.emailTemplate.action.back")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.emailTemplate.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.emailTemplate.subtitle")}</p>
          </div>
          <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/settings/email-templates/new">
            <Plus aria-hidden="true" size={18} />
            {t("settings.emailTemplate.action.add")}
          </Link>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.emailTemplate.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.emailTemplate.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.emailTemplates.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.emailTemplate.empty")}</p>
          ) : null}
          {state.emailTemplates.map((emailTemplate) => (
            <EmailTemplateListCard
              emailTemplate={emailTemplate}
              isBusy={pendingId === emailTemplate.id}
              key={emailTemplate.id}
              onDelete={(template) => {
                if (!window.confirm(t("settings.emailTemplate.action.deleteConfirm"))) return;
                void handleDelete(template.id);
              }}
              onToggleActive={(template) => {
                void handleToggleActive(template.id, template.isActive);
              }}
              t={t}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
