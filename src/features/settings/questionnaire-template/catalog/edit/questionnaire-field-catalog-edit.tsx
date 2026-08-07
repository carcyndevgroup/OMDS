"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { QuestionnaireTemplatePageHeader } from "../../components/questionnaire-template-page-header";
import { QuestionnaireFieldCatalogForm } from "../components/questionnaire-field-catalog-form";
import { useQuestionnaireFieldCatalog } from "../hooks/use-questionnaire-field-catalog";
import { useQuestionnaireFieldCatalogMutation } from "../hooks/use-questionnaire-field-catalog-mutation";
import type { QuestionnaireFieldCatalogFormValues, QuestionnaireFieldCatalogItem } from "../types/questionnaire-field-catalog";

type QuestionnaireFieldCatalogEditProps = { id: string };

const toFormValues = (item: QuestionnaireFieldCatalogItem): QuestionnaireFieldCatalogFormValues => ({
  fieldKey: item.fieldKey,
  helperEn: item.helperEn,
  helperEs: item.helperEs,
  isActive: item.isActive,
  labelEn: item.labelEn,
  labelEs: item.labelEs,
  questionType: item.questionType,
  sortOrder: item.sortOrder,
  targetColumn: item.targetColumn,
  targetTable: item.targetTable,
});

export function QuestionnaireFieldCatalogEdit({ id }: QuestionnaireFieldCatalogEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useQuestionnaireFieldCatalog(id);
  const mutation = useQuestionnaireFieldCatalogMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.catalog.loading")}</main>;
  }

  if (state.hasError || !state.item) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.questionnaireTemplate.catalog.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <QuestionnaireTemplatePageHeader backHref="/settings/questionnaire-templates/catalog" backLabel={t("settings.questionnaireTemplate.action.back")} title={t("settings.questionnaireTemplate.catalog.edit.title")} />
        <QuestionnaireFieldCatalogForm
          cancelHref="/settings/questionnaire-templates/catalog"
          errorKey="settings.questionnaireTemplate.catalog.edit.error"
          initialValues={toFormValues(state.item)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/questionnaire-templates/catalog")}
          status={mutation.status}
          submitKey="settings.questionnaireTemplate.action.save"
          successKey="settings.questionnaireTemplate.catalog.edit.success"
        />
      </div>
    </main>
  );
}
