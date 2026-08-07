"use client";

import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n";

import { ContractTemplateForm } from "../components/contract-template-form";
import { ContractTemplatePageHeader } from "../components/contract-template-page-header";
import { useContractTemplateMutation } from "../hooks/use-contract-template-mutation";
import { initialContractTemplateFormValues } from "../schemas/contract-template-schema";

export function ContractTemplateCreate() {
  const { t } = useTranslation();
  const router = useRouter();
  const mutation = useContractTemplateMutation();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <ContractTemplatePageHeader backLabel={t("settings.contractTemplate.action.back")} title={t("settings.contractTemplate.new.title")} />
        <ContractTemplateForm
          cancelHref="/settings/contract-templates"
          errorKey="settings.contractTemplate.message.createError"
          initialValues={initialContractTemplateFormValues}
          onSubmit={mutation.mutate}
          onSuccess={() => router.push("/settings/contract-templates")}
          status={mutation.status}
          submitKey="settings.contractTemplate.action.create"
          successKey="settings.contractTemplate.message.created"
        />
      </div>
    </main>
  );
}
