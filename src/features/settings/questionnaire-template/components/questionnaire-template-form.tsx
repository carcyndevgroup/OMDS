"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import { QuestionnaireDefinitionBuilder } from "./questionnaire-definition-builder";
import { useQuestionnaireTemplateForm } from "../hooks/use-questionnaire-template-form";
import type { QuestionnaireTemplateFormValues } from "../types/questionnaire-template";

type QuestionnaireTemplateFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: QuestionnaireTemplateFormValues;
  onSubmit: (values: QuestionnaireTemplateFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

const bookingTypeOptions = [
  { label: "Direct", value: "direct" },
  { label: "Preferred Vendor", value: "preferred_vendor" },
];

const eventTypeOptions = [
  { label: "Wedding", value: "wedding" },
  { label: "Social Event", value: "social_event" },
  { label: "Corporate Event", value: "corporate_event" },
  { label: "Convention", value: "convention" },
  { label: "Other", value: "other" },
];

export function QuestionnaireTemplateForm(props: QuestionnaireTemplateFormProps) {
  const { t } = useTranslation();
  const form = useQuestionnaireTemplateForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={form.errors.templateKey} label={t("settings.questionnaireTemplate.field.templateKey")} onChange={(value) => form.setField("templateKey", value)} t={t} value={form.values.templateKey} />
        <CrmTextInput error={form.errors.title} label={t("settings.questionnaireTemplate.field.title")} onChange={(value) => form.setField("title", value)} t={t} value={form.values.title} />
        <CrmSelect label={t("settings.questionnaireTemplate.field.bookingType")} onChange={(value) => form.setField("bookingType", value as QuestionnaireTemplateFormValues["bookingType"])} options={bookingTypeOptions} t={t} value={form.values.bookingType} />
        <CrmSelect label={t("settings.questionnaireTemplate.field.eventType")} onChange={(value) => form.setField("eventType", value as QuestionnaireTemplateFormValues["eventType"])} options={eventTypeOptions} t={t} value={form.values.eventType} />
      </div>
      <CrmTextarea label={t("settings.questionnaireTemplate.field.description")} onChange={(value) => form.setField("description", value)} placeholder={t("settings.questionnaireTemplate.placeholder.description")} t={t} value={form.values.description} />
      <QuestionnaireDefinitionBuilder onChange={(value) => form.setField("definitionJson", value)} value={form.values.definitionJson} />
      <CrmTextarea error={form.errors.definitionJson} label={t("settings.questionnaireTemplate.field.definitionJson")} onChange={(value) => form.setField("definitionJson", value)} placeholder={t("settings.questionnaireTemplate.placeholder.definitionJson")} t={t} value={form.values.definitionJson} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isDefault} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isDefault", event.target.checked)} type="checkbox" />
          {t("settings.questionnaireTemplate.field.isDefault")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
          {t("settings.questionnaireTemplate.field.active")}
        </label>
      </div>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("settings.questionnaireTemplate.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
