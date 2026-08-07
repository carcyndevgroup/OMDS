"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import { questionFieldOptions, questionTypeOptions } from "../../components/questionnaire-definition-options";
import { useQuestionnaireFieldCatalogForm } from "../hooks/use-questionnaire-field-catalog-form";
import type { QuestionnaireFieldCatalogFormValues } from "../types/questionnaire-field-catalog";
import { getQuestionnaireFieldCatalogDefaults } from "../utils/questionnaire-field-catalog-defaults";

type QuestionnaireFieldCatalogFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: QuestionnaireFieldCatalogFormValues;
  onSubmit: (values: QuestionnaireFieldCatalogFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function QuestionnaireFieldCatalogForm(props: QuestionnaireFieldCatalogFormProps) {
  const { t } = useTranslation();
  const form = useQuestionnaireFieldCatalogForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  const localizedQuestionTypeOptions = questionTypeOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }));

  const localizedQuestionFieldOptions = questionFieldOptions.map((option) => ({
    label: t(option.labelKey),
    value: option.value,
  }));

  const fieldKeyOptions = form.values.fieldKey && !localizedQuestionFieldOptions.some((option) => option.value === form.values.fieldKey)
    ? [...localizedQuestionFieldOptions, { label: form.values.fieldKey, value: form.values.fieldKey }]
    : localizedQuestionFieldOptions;

  const selectedDefaults = getQuestionnaireFieldCatalogDefaults(form.values.fieldKey);
  const technicalValues = {
    questionType: selectedDefaults?.questionType ?? form.values.questionType,
    targetColumn: selectedDefaults?.targetColumn ?? form.values.targetColumn,
    targetTable: selectedDefaults?.targetTable ?? form.values.targetTable,
  };

  const technicalQuestionTypeLabel =
    localizedQuestionTypeOptions.find((option) => option.value === technicalValues.questionType)?.label ?? technicalValues.questionType;

  const handleFieldKeyChange = (fieldKey: string) => {
    const defaults = getQuestionnaireFieldCatalogDefaults(fieldKey);
    if (defaults) {
      form.setFields({
        fieldKey,
        labelEn: defaults.labelEn,
        labelEs: defaults.labelEs,
        questionType: defaults.questionType,
        targetColumn: defaults.targetColumn,
        targetTable: defaults.targetTable,
      });
      return;
    }

    form.setField("fieldKey", fieldKey);
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <CrmSelect error={form.errors.fieldKey} label={t("settings.questionnaireTemplate.catalog.field.fieldKey")} onChange={handleFieldKeyChange} options={fieldKeyOptions} t={t} value={form.values.fieldKey} />
          <p className="text-xs leading-5 text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.fieldKeyHint")}</p>
        </div>
        <CrmTextInput error={form.errors.labelEn} label={t("settings.questionnaireTemplate.catalog.field.labelEn")} onChange={(value) => form.setField("labelEn", value)} t={t} value={form.values.labelEn} />
        <CrmTextInput error={form.errors.labelEs} label={t("settings.questionnaireTemplate.catalog.field.labelEs")} onChange={(value) => form.setField("labelEs", value)} t={t} value={form.values.labelEs} />
        <CrmTextInput label={t("settings.questionnaireTemplate.catalog.field.sortOrder")} onChange={(value) => form.setField("sortOrder", value)} t={t} value={form.values.sortOrder} />
      </div>
      <section className="rounded-md border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white">{t("settings.questionnaireTemplate.catalog.field.mappingPreview")}</h3>
            <p className="mt-1 text-xs text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.mappingPreviewHint")}</p>
          </div>
          {selectedDefaults ? <span className="rounded-full border border-cyan-300/30 px-3 py-1 text-xs font-bold text-cyan-200">{t("settings.questionnaireTemplate.catalog.field.mappingLocked")}</span> : null}
        </div>
        <dl className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.questionType")}</dt>
            <dd className="mt-1 text-zinc-100">{technicalQuestionTypeLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetTable")}</dt>
            <dd className="mt-1 text-zinc-100">{technicalValues.targetTable}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.targetColumn")}</dt>
            <dd className="mt-1 text-zinc-100">{technicalValues.targetColumn}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-zinc-500">{t("settings.questionnaireTemplate.catalog.field.fieldKey")}</dt>
            <dd className="mt-1 text-zinc-100">{form.values.fieldKey || "-"}</dd>
          </div>
        </dl>
      </section>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextarea label={t("settings.questionnaireTemplate.catalog.field.helperEn")} onChange={(value) => form.setField("helperEn", value)} placeholder={t("settings.questionnaireTemplate.placeholder.helper")} t={t} value={form.values.helperEn} />
        <CrmTextarea label={t("settings.questionnaireTemplate.catalog.field.helperEs")} onChange={(value) => form.setField("helperEs", value)} placeholder={t("settings.questionnaireTemplate.placeholder.helper")} t={t} value={form.values.helperEs} />
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
        {t("settings.questionnaireTemplate.field.active")}
      </label>
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
