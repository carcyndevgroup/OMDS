"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { QuestionnaireTemplateForm } from "../components/questionnaire-template-form";
import { QuestionnaireTemplatePageHeader } from "../components/questionnaire-template-page-header";
import { useQuestionnaireTemplateMutation } from "../hooks/use-questionnaire-template-mutation";
import { initialQuestionnaireTemplateFormValues } from "../schemas/questionnaire-template-schema";

export function QuestionnaireTemplateCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useQuestionnaireTemplateMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <QuestionnaireTemplatePageHeader backLabel={t("settings.questionnaireTemplate.action.back")} title={t("settings.questionnaireTemplate.new.title")} />
        <QuestionnaireTemplateForm
          cancelHref="/settings/questionnaire-templates"
          errorKey="settings.questionnaireTemplate.message.createError"
          initialValues={initialQuestionnaireTemplateFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/questionnaire-templates")}
          status={mutation.status}
          submitKey="settings.questionnaireTemplate.action.create"
          successKey="settings.questionnaireTemplate.message.created"
        />
      </div>
    </main>
  );
}
