"use client";

import { SquarePen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { QuestionnaireTemplatePageHeader } from "../../components/questionnaire-template-page-header";
import { useQuestionnaireFieldCatalogList } from "../hooks/use-questionnaire-field-catalog-list";
import { buildDefaultQuestionnaireFieldCatalogValues } from "../utils/questionnaire-field-catalog-defaults";

export function QuestionnaireFieldCatalogList() {
  const { locale, t } = useTranslation();
  const state = useQuestionnaireFieldCatalogList();
  const previewItems = buildDefaultQuestionnaireFieldCatalogValues();
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [showImportPreview, setShowImportPreview] = useState(false);

  const handleImportDefaults = async () => {
    setImportMessage(null);
    setIsImporting(true);
    setShowImportPreview(false);

    try {
      const response = await fetch("/api/settings/questionnaire-field-catalog", {
        body: JSON.stringify({ action: "import_defaults" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      if (!response.ok) throw new Error("questionnaire_field_catalog_import_failed");

      const payload = (await response.json()) as { data: { created: number; total: number; updated: number } };
      setImportMessage(
        t("settings.questionnaireTemplate.catalog.import.success")
          .replace("{created}", String(payload.data.created))
          .replace("{updated}", String(payload.data.updated))
          .replace("{total}", String(payload.data.total)),
      );
      state.reload();
    } catch {
      setImportMessage(t("settings.questionnaireTemplate.catalog.import.error"));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <QuestionnaireTemplatePageHeader
          backLabel={t("settings.questionnaireTemplate.action.back")}
          title={t("settings.questionnaireTemplate.catalog.title")}
        />
        <header className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-900 p-5">
          <div>
            <p className="text-sm text-zinc-300">{t("settings.questionnaireTemplate.catalog.subtitle")}</p>
            <p className="mt-2 text-xs text-zinc-500">{t("settings.questionnaireTemplate.catalog.helper")}</p>
            <p className="mt-2 text-xs text-cyan-200">{t("settings.questionnaireTemplate.catalog.createOnlyFromImport")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isImporting}
              onClick={() => setShowImportPreview(true)}
              type="button"
            >
              {t("settings.questionnaireTemplate.catalog.action.previewDefaults")}
            </button>
          </div>
        </header>
        {showImportPreview ? (
          <section className="rounded-md border border-cyan-300/20 bg-zinc-900 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-white">{t("settings.questionnaireTemplate.catalog.preview.title")}</h2>
                <p className="mt-1 text-sm text-zinc-400">{t("settings.questionnaireTemplate.catalog.preview.summary")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isImporting}
                  onClick={() => setShowImportPreview(false)}
                  type="button"
                >
                  {t("settings.questionnaireTemplate.action.cancel")}
                </button>
                <button
                  className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isImporting}
                  onClick={handleImportDefaults}
                  type="button"
                >
                  {isImporting ? t("settings.questionnaireTemplate.catalog.import.loading") : t("settings.questionnaireTemplate.catalog.action.confirmImport")}
                </button>
              </div>
            </div>
            <div className="mt-4 max-h-[28rem] overflow-auto rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {previewItems.map((item) => (
                  <article key={item.fieldKey} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
                    <h3 className="text-sm font-bold text-white">{locale === "es" ? item.labelEs : item.labelEn}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{item.fieldKey}</p>
                    <dl className="mt-3 space-y-2 text-xs text-zinc-400">
                      <div>
                        <dt className="uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetTable")}</dt>
                        <dd className="text-zinc-200">{item.targetTable}</dd>
                      </div>
                      <div>
                        <dt className="uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetColumn")}</dt>
                        <dd className="text-zinc-200">{item.targetColumn}</dd>
                      </div>
                      <div>
                        <dt className="uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.questionType")}</dt>
                        <dd className="text-zinc-200">{item.questionType}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        {importMessage ? (
          <p className="rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">{importMessage}</p>
        ) : null}

        <section className="space-y-3">
          {state.isLoading ? <p className="py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.catalog.loading")}</p> : null}
          {state.hasError ? <p className="py-12 text-center text-sm text-rose-300">{t("settings.questionnaireTemplate.catalog.loadError")}</p> : null}
          {!state.isLoading && !state.hasError && !state.items.length ? (
            <p className="rounded-md border border-dashed border-zinc-800 py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.catalog.empty")}</p>
          ) : null}
          {state.items.map((item) => (
            <article key={item.id} className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">{locale === "es" ? item.labelEs : item.labelEn}</h2>
                  <p className="mt-1 text-xs text-zinc-500">{item.fieldKey}</p>
                </div>
                <Link className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" href={`/settings/questionnaire-templates/catalog/${item.id}/edit`}>
                  <SquarePen aria-hidden="true" size={16} />
                  {t("settings.questionnaireTemplate.action.edit")}
                </Link>
              </div>
              <dl className="mt-3 grid gap-2 text-sm text-zinc-400 md:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetTable")}</dt>
                  <dd className="text-zinc-200">{item.targetTable}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetColumn")}</dt>
                  <dd className="text-zinc-200">{item.targetColumn}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.questionType")}</dt>
                  <dd className="text-zinc-200">{item.questionType}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
