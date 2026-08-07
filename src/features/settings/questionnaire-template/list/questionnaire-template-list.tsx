"use client";

import { ArrowLeft, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useQuestionnaireTemplateList } from "../hooks/use-questionnaire-template-list";
import { useQuestionnaireTemplateMutation } from "../hooks/use-questionnaire-template-mutation";
import { QuestionnaireTemplateListCard } from "./questionnaire-template-list-card";

export function QuestionnaireTemplateList() {
  const { t } = useTranslation();
  const state = useQuestionnaireTemplateList();
  const mutation = useQuestionnaireTemplateMutation();
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
          ? t("settings.questionnaireTemplate.action.deleteDefaultError")
          : code === "template_in_use_delete_forbidden"
            ? t("settings.questionnaireTemplate.action.deleteInUseError")
          : t("settings.questionnaireTemplate.action.deleteError");
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
              {t("settings.questionnaireTemplate.action.back")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("settings.questionnaireTemplate.title")}</h1>
            <p className="mt-2 text-sm font-medium text-zinc-500">{t("settings.questionnaireTemplate.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="inline-flex h-11 items-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200" href="/settings/questionnaire-templates/catalog">
              <BookOpen aria-hidden="true" size={18} />
              {t("settings.questionnaireTemplate.action.catalog")}
            </Link>
            <Link className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" href="/settings/questionnaire-templates/new">
              <Plus aria-hidden="true" size={18} />
              {t("settings.questionnaireTemplate.action.add")}
            </Link>
          </div>
        </header>
        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.questionnaireTemplate.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.questionnaireTemplates.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.empty")}</p>
          ) : null}
          {state.questionnaireTemplates.map((questionnaireTemplate) => (
            <QuestionnaireTemplateListCard
              isBusy={pendingId === questionnaireTemplate.id}
              key={questionnaireTemplate.id}
              onDelete={(template) => {
                if (!window.confirm(t("settings.questionnaireTemplate.action.deleteConfirm"))) return;
                void handleDelete(template.id);
              }}
              onToggleActive={(template) => {
                void handleToggleActive(template.id, template.isActive);
              }}
              questionnaireTemplate={questionnaireTemplate}
              t={t}
            />
          ))}
        </section>
      </div>
    </main>
  );
}
