"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { QuestionnaireTemplatePageHeader } from "../../components/questionnaire-template-page-header";
import { QuestionnaireFieldCatalogForm } from "../components/questionnaire-field-catalog-form";
import { useQuestionnaireFieldCatalogMutation } from "../hooks/use-questionnaire-field-catalog-mutation";
import { initialQuestionnaireFieldCatalogFormValues } from "../schemas/questionnaire-field-catalog-schema";

export function QuestionnaireFieldCatalogCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useQuestionnaireFieldCatalogMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <QuestionnaireTemplatePageHeader backHref="/settings/questionnaire-templates/catalog" backLabel={t("settings.questionnaireTemplate.action.back")} title={t("settings.questionnaireTemplate.catalog.new.title")} />
        <QuestionnaireFieldCatalogForm
          cancelHref="/settings/questionnaire-templates/catalog"
          errorKey="settings.questionnaireTemplate.catalog.edit.error"
          initialValues={initialQuestionnaireFieldCatalogFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/questionnaire-templates/catalog")}
          status={mutation.status}
          submitKey="settings.questionnaireTemplate.action.create"
          successKey="settings.questionnaireTemplate.catalog.edit.success"
        />
      </div>
    </main>
  );
}
