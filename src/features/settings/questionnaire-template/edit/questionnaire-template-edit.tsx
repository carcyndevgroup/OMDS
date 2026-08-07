"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { QuestionnaireTemplateForm } from "../components/questionnaire-template-form";
import { QuestionnaireTemplatePageHeader } from "../components/questionnaire-template-page-header";
import { useQuestionnaireTemplate } from "../hooks/use-questionnaire-template";
import { useQuestionnaireTemplateMutation } from "../hooks/use-questionnaire-template-mutation";
import type { QuestionnaireTemplate, QuestionnaireTemplateFormValues } from "../types/questionnaire-template";

type QuestionnaireTemplateEditProps = { id: string };

const toFormValues = (template: QuestionnaireTemplate): QuestionnaireTemplateFormValues => ({
  bookingType: template.bookingType,
  definitionJson: JSON.stringify(template.definition, null, 2),
  description: template.description,
  eventType: template.eventType,
  isActive: template.isActive,
  isDefault: template.isDefault,
  templateKey: template.templateKey,
  title: template.title,
});

export function QuestionnaireTemplateEdit({ id }: QuestionnaireTemplateEditProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const state = useQuestionnaireTemplate(id);
  const mutation = useQuestionnaireTemplateMutation(id);

  if (state.isLoading) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-zinc-500">{t("settings.questionnaireTemplate.loading")}</main>;
  }

  if (state.hasError || !state.questionnaireTemplate) {
    return <main className="min-h-screen bg-zinc-950 px-4 py-12 text-center text-sm text-rose-300">{t("settings.questionnaireTemplate.loadError")}</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <QuestionnaireTemplatePageHeader backLabel={t("settings.questionnaireTemplate.action.back")} title={t("settings.questionnaireTemplate.edit.title")} />
        <QuestionnaireTemplateForm
          cancelHref="/settings/questionnaire-templates"
          errorKey="settings.questionnaireTemplate.edit.error"
          initialValues={toFormValues(state.questionnaireTemplate)}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/questionnaire-templates")}
          status={mutation.status}
          submitKey="settings.questionnaireTemplate.action.save"
          successKey="settings.questionnaireTemplate.edit.success"
        />
      </div>
    </main>
  );
}
