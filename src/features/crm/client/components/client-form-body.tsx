"use client";

import { RotateCcw, Save } from "lucide-react";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { useClientForm } from "../hooks/use-client-form";
import { useVenues } from "../hooks/use-venues";
import { initialClientFormValues } from "../schemas/client-schema";
import type { ClientFormValues } from "../types/client";
import { ClientBookingSection } from "./client-booking-section";
import { ClientDetailsSection } from "./client-details-section";
import { ClientEventSection } from "./client-event-section";
import { ClientOtherSection } from "./client-other-section";
import { ClientServicesSection } from "./client-services-section";
import { ClientSocialSection } from "./client-social-section";

type MutationStatus = "idle" | "loading" | "success" | "error";

type ClientFormBodyProps = {
  errorKey: TranslationKey;
  initialValues?: ClientFormValues;
  onSubmit: (values: ClientFormValues) => Promise<void>;
  onSuccess?: () => void;
  resetStatus: () => void;
  status: MutationStatus;
  submitKey: TranslationKey;
  submittingKey: TranslationKey;
  successKey: TranslationKey;
};

export function ClientFormBody(props: ClientFormBodyProps) {
  const { t } = useTranslation();
  const venues = useVenues();
  const form = useClientForm(
    props.onSubmit,
    props.initialValues ?? initialClientFormValues,
  );
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
      const submitted = await form.submitForm();
      if (submitted) {
        form.resetForm();
        props.onSuccess?.();
      }
    } catch {
      return;
    }
  };

  const reset = () => {
    form.resetForm();
    props.resetStatus();
  };

  return (
    <form
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/30 sm:p-6 lg:p-8"
      onSubmit={handleSubmit}
    >
      <ClientEventSection {...sectionProps} />
      <ClientDetailsSection {...sectionProps} />
      <ClientServicesSection {...sectionProps} />
      <ClientSocialSection {...sectionProps} />
      <ClientOtherSection {...sectionProps} />
      <ClientBookingSection {...sectionProps} />

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? (
            <span className="text-emerald-300">{t(props.successKey)}</span>
          ) : null}
          {props.status === "error" ? (
            <span className="text-rose-300">{t(props.errorKey)}</span>
          ) : null}
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200 transition hover:bg-white/[0.04] sm:flex-none"
            onClick={reset}
            type="button"
          >
            <RotateCcw aria-hidden="true" size={16} />
            {t("crm.client.action.reset")}
          </button>
          <button
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200 disabled:opacity-60 sm:flex-none"
            disabled={form.isSubmitting}
            type="submit"
          >
            <Save aria-hidden="true" size={16} />
            {form.isSubmitting ? t(props.submittingKey) : t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
