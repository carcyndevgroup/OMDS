"use client";

import { Download, Eye, Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { useCompanyProfile } from "@/features/settings/company-profile/hooks/use-company-profile";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";
import { findUnknownTemplateTokens } from "@/features/settings/template-tools/template-token-catalog";

import { useContractTemplateForm } from "../hooks/use-contract-template-form";
import type { ContractTemplateFormValues } from "../types/contract-template";
import { renderContractPreviewHtml } from "@/features/crm/shared/documents/contract-content-renderer";

import { buildContractPreviewPayload } from "../utils/contract-template-preview";
import { ContractTemplateBodyEditor } from "./contract-template-body-editor";

type ContractTemplateFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: ContractTemplateFormValues;
  onSubmit: (values: ContractTemplateFormValues) => Promise<void>;
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

export function ContractTemplateForm(props: ContractTemplateFormProps) {
  const { t } = useTranslation();
  const form = useContractTemplateForm(props.initialValues, props.onSubmit);
  const companyProfile = useCompanyProfile();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewPayload = useMemo(() => buildContractPreviewPayload({
    body: form.values.body,
    bookingType: form.values.bookingType,
    companyProfile: companyProfile.profile ?? undefined,
    eventType: form.values.eventType,
    issuedAt: new Date().toISOString(),
    status: "sent",
    title: form.values.title || form.values.templateKey || "Contract",
  }), [companyProfile.profile, form.values.body, form.values.bookingType, form.values.eventType, form.values.title, form.values.templateKey]);
  const previewBody = previewPayload.body;
  const previewHtml = renderContractPreviewHtml(previewBody, {
    "company.dbaName": companyProfile.profile?.dbaName ?? "OMDS Catering",
    "company.legalName": companyProfile.profile?.legalName ?? "Oh My Desserts & Snacks MX",
  });
  const unknownTokens = findUnknownTemplateTokens([form.values.body]);
  const hasUnknownTokens = unknownTokens.length > 0;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (hasUnknownTokens) return;
    if (await form.submit()) props.onSuccess?.();
  };

  const downloadPreviewPdf = async () => {
    const response = await fetch("/api/settings/contract-templates/preview-pdf", {
      body: JSON.stringify({
        body: previewBody,
        companyProfile: companyProfile.profile ?? undefined,
        issuedAt: new Date().toISOString(),
        status: "sent",
        title: previewPayload.title,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(form.values.templateKey || form.values.title || "contract").toLowerCase().replace(/\s+/g, "-") || "contract"}.pdf`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <CrmTextInput error={form.errors.templateKey} label={t("settings.contractTemplate.field.templateKey")} onChange={(value) => form.setField("templateKey", value)} t={t} value={form.values.templateKey} />
            <CrmTextInput error={form.errors.title} label={t("settings.contractTemplate.field.title")} onChange={(value) => form.setField("title", value)} t={t} value={form.values.title} />
            <CrmSelect label={t("settings.contractTemplate.field.bookingType")} onChange={(value) => form.setField("bookingType", value as ContractTemplateFormValues["bookingType"])} options={bookingTypeOptions} t={t} value={form.values.bookingType} />
            <CrmSelect label={t("settings.contractTemplate.field.eventType")} onChange={(value) => form.setField("eventType", value as ContractTemplateFormValues["eventType"])} options={eventTypeOptions} t={t} value={form.values.eventType} />
          </div>
          <CrmTextarea label={t("settings.contractTemplate.field.description")} onChange={(value) => form.setField("description", value)} placeholder={t("settings.contractTemplate.placeholder.description")} t={t} value={form.values.description} />
          <ContractTemplateBodyEditor error={form.errors.body} label={t("settings.contractTemplate.field.body")} onChange={(value) => form.setField("body", value)} placeholder={t("settings.contractTemplate.placeholder.body")} value={form.values.body} />
        </div>
        <aside className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-4 lg:sticky lg:top-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">{t("settings.contractTemplate.preview.title")}</h2>
              <p className="text-sm text-zinc-500">{t("settings.contractTemplate.preview.subtitle")}</p>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => setIsPreviewOpen((value) => !value)} type="button">
                <Eye aria-hidden="true" size={15} />
                {isPreviewOpen ? t("settings.contractTemplate.preview.hide") : t("settings.contractTemplate.preview.show")}
              </button>
              <button className="inline-flex h-9 items-center gap-2 rounded-md bg-cyan-300 px-3 text-sm font-bold text-zinc-950" onClick={() => void downloadPreviewPdf()} type="button">
                <Download aria-hidden="true" size={15} />
                {t("settings.contractTemplate.preview.download")}
              </button>
            </div>
          </div>
          {isPreviewOpen ? (
            <article className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-cyan-200">{previewPayload.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{t(previewPayload.status === "signed" ? "crm.contract.status.signed" : "crm.contract.status.sent")}</p>
                </div>
              </div>
              <div className="mt-5 rounded-md border border-zinc-800 bg-zinc-950 p-6 text-[15px] leading-8 text-zinc-200">
                <div
                  className="space-y-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-cyan-100 [&_p]:m-0 [&_p]:leading-8 [&_ul]:my-3 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:space-y-2 [&_ol]:pl-5"
                  dangerouslySetInnerHTML={{ __html: previewHtml.trim() || t("settings.contractTemplate.preview.empty") }}
                />
              </div>
            </article>
          ) : null}
        </aside>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isDefault} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isDefault", event.target.checked)} type="checkbox" />
          {t("settings.contractTemplate.field.isDefault")}
        </label>
        <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
          <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
          {t("settings.contractTemplate.field.active")}
        </label>
      </div>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {hasUnknownTokens ? <span className="text-amber-300">{t("settings.templateTokens.blockedUnknown")}</span> : null}
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("settings.contractTemplate.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 disabled:opacity-60" disabled={form.isSubmitting || hasUnknownTokens} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
