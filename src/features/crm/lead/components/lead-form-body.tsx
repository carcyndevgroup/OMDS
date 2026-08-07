"use client";

import { RotateCcw, Save } from "lucide-react";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import {
  useLeadForm,
  type LeadFormSubmitHandler,
} from "../hooks/use-lead-form";
import { useVenues } from "../../client/hooks/use-venues";
import { initialLeadFormValues } from "../schemas/lead-schema";
import type { LeadFormValues } from "../types/lead";
import { LeadClientSection } from "./lead-client-section";
import { LeadEventSection } from "./lead-event-section";
import { LeadOtherSection } from "./lead-other-section";
import { LeadServicesSection } from "./lead-services-section";

type MutationStatus = "idle" | "loading" | "success" | "error";

type LeadFormBodyProps = {
  errorKey: TranslationKey;
  initialValues?: LeadFormValues;
  onSubmit: LeadFormSubmitHandler;
  onSuccess?: () => void;
  resetStatus: () => void;
  status: MutationStatus;
  submitKey: TranslationKey;
  submittingKey: TranslationKey;
  successKey: TranslationKey;
};

export function LeadFormBody({
  errorKey,
  initialValues = initialLeadFormValues,
  onSubmit,
  onSuccess,
  resetStatus,
  status,
  submitKey,
  submittingKey,
  successKey,
}: LeadFormBodyProps) {
  const { t } = useTranslation();
  const venues = useVenues();
  const form = useLeadForm(onSubmit, initialValues);
  const sectionProps = {
    errors: form.errors,
    setFieldValue: form.setFieldValue,
    t,
    values: form.values,
    venues,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const didSubmit = await form.submitForm();
      if (didSubmit) {
        form.resetForm();
        onSuccess?.();
      }
    } catch {
      return;
    }
  };

  const handleReset = () => {
    form.resetForm();
    resetStatus();
  };

  return (
    <form
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/30 sm:p-6 lg:p-8"
      onSubmit={handleSubmit}
    >
      <LeadClientSection {...sectionProps} />
      <LeadEventSection {...sectionProps} />
      <LeadServicesSection {...sectionProps} />
      <LeadOtherSection {...sectionProps} />

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-5 text-sm font-medium">
          {status === "success" ? (
            <span className="text-emerald-300">{t(successKey)}</span>
          ) : null}
          {status === "error" ? (
            <span className="text-rose-300">{t(errorKey)}</span>
          ) : null}
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 transition hover:border-zinc-600 hover:bg-white/[0.04] sm:flex-none"
            onClick={handleReset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
            {t("crm.lead.action.reset")}
          </button>
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            disabled={form.isSubmitting}
            type="submit"
          >
            <Save aria-hidden="true" size={16} />
            {form.isSubmitting ? t(submittingKey) : t(submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
