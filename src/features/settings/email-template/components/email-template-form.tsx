"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";
import { TemplateConditionAssistant } from "@/features/settings/template-tools/template-condition-assistant";
import { TemplateSnippetAssistant } from "@/features/settings/template-tools/template-snippet-assistant";
import { TemplateTokenAssistant } from "@/features/settings/template-tools/template-token-assistant";
import {
  findUnknownTemplateTokens,
  insertTemplateToken,
  renderTemplatePreview,
} from "@/features/settings/template-tools/template-token-catalog";
import { appendTemplateSnippet } from "@/features/settings/template-tools/template-snippet-library";

import { useEmailTemplateForm } from "../hooks/use-email-template-form";
import type { EmailTemplateFormValues } from "../types/email-template";

type EmailTemplateFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: EmailTemplateFormValues;
  onSubmit: (values: EmailTemplateFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function EmailTemplateForm(props: EmailTemplateFormProps) {
  const { t } = useTranslation();
  const form = useEmailTemplateForm(props.initialValues, props.onSubmit);
  const unknownTokens = findUnknownTemplateTokens([form.values.subject, form.values.body]);
  const previewBody = renderTemplatePreview(form.values.body, {
    documentKind: form.values.documentKind,
  });
  const previewSubject = renderTemplatePreview(form.values.subject, {
    documentKind: form.values.documentKind,
  });
  const hasUnknownTokens = unknownTokens.length > 0;
  const documentKindOptions = [
    { label: t("settings.emailTemplate.kind.general"), value: "general" },
    { label: t("settings.emailTemplate.kind.questionnaire"), value: "questionnaire" },
    { label: t("settings.emailTemplate.kind.contract"), value: "contract" },
    { label: t("settings.emailTemplate.kind.invoice"), value: "invoice" },
    { label: t("settings.emailTemplate.kind.quote"), value: "quote" },
  ];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasUnknownTokens) return;
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <CrmTextInput error={form.errors.templateKey} label={t("settings.emailTemplate.field.templateKey")} onChange={(value) => form.setField("templateKey", value)} t={t} value={form.values.templateKey} />
            <CrmTextInput error={form.errors.title} label={t("settings.emailTemplate.field.title")} onChange={(value) => form.setField("title", value)} t={t} value={form.values.title} />
            <CrmSelect label={t("settings.emailTemplate.field.documentKind")} onChange={(value) => form.setField("documentKind", value as EmailTemplateFormValues["documentKind"])} options={documentKindOptions} t={t} value={form.values.documentKind} />
            <CrmTextInput error={form.errors.subject} label={t("settings.emailTemplate.field.subject")} onChange={(value) => form.setField("subject", value)} t={t} value={form.values.subject} />
          </div>
          <CrmTextarea label={t("settings.emailTemplate.field.description")} onChange={(value) => form.setField("description", value)} placeholder={t("settings.emailTemplate.placeholder.description")} t={t} value={form.values.description} />
          <TemplateTokenAssistant
            onInsertBody={(token) => {
              form.setField("body", insertTemplateToken(form.values.body, token));
            }}
            onInsertSubject={(token) => {
              form.setField("subject", insertTemplateToken(form.values.subject, token));
            }}
            t={t}
            unknownTokens={unknownTokens}
          />
          <TemplateSnippetAssistant
            onInsertBody={(snippet) => {
              form.setField("body", appendTemplateSnippet(form.values.body, snippet));
            }}
            onInsertSubject={(subjectSnippet) => {
              form.setField("subject", appendTemplateSnippet(form.values.subject, subjectSnippet));
            }}
            t={t}
          />
          <TemplateConditionAssistant
            onInsertBody={(snippet) => {
              form.setField("body", appendTemplateSnippet(form.values.body, snippet));
            }}
            onInsertSubject={(snippet) => {
              form.setField("subject", appendTemplateSnippet(form.values.subject, snippet));
            }}
            t={t}
          />
          <CrmTextarea error={form.errors.body} label={t("settings.emailTemplate.field.body")} onChange={(value) => form.setField("body", value)} placeholder={t("settings.emailTemplate.placeholder.body")} t={t} value={form.values.body} />
        </div>
        <aside className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-4 lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-white">{t("settings.emailTemplate.preview.title")}</h2>
          <p className="text-sm text-zinc-500">{t("settings.emailTemplate.preview.subtitle")}</p>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{t("settings.emailTemplate.field.subject")}</p>
            <h3 className="mt-1 text-sm font-bold text-cyan-200">{previewSubject || "-"}</h3>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-500">{t("settings.emailTemplate.field.body")}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
              {previewBody.trim() || t("settings.emailTemplate.preview.empty")}
            </p>
          </div>
        </aside>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isDefault} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isDefault", event.target.checked)} type="checkbox" />
          {t("settings.emailTemplate.field.isDefault")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
          {t("settings.emailTemplate.field.active")}
        </label>
      </div>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {hasUnknownTokens ? <span className="text-amber-300">{t("settings.templateTokens.blockedUnknown")}</span> : null}
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("settings.emailTemplate.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 disabled:opacity-60" disabled={form.isSubmitting || hasUnknownTokens} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
