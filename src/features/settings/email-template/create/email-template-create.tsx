"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { EmailTemplateForm } from "../components/email-template-form";
import { EmailTemplatePageHeader } from "../components/email-template-page-header";
import { useEmailTemplateMutation } from "../hooks/use-email-template-mutation";
import { initialEmailTemplateFormValues } from "../schemas/email-template-schema";

export function EmailTemplateCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useEmailTemplateMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <EmailTemplatePageHeader backLabel={t("settings.emailTemplate.action.back")} title={t("settings.emailTemplate.new.title")} />
        <EmailTemplateForm
          cancelHref="/settings/email-templates"
          errorKey="settings.emailTemplate.message.createError"
          initialValues={initialEmailTemplateFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/email-templates")}
          status={mutation.status}
          submitKey="settings.emailTemplate.action.create"
          successKey="settings.emailTemplate.message.created"
        />
      </div>
    </main>
  );
}
