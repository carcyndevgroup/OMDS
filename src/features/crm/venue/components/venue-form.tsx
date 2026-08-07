"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { useVenueForm } from "../hooks/use-venue-form";
import type { VenueFormValues } from "../types/venue";
import {
  VenueContactFields,
  VenueCoreFields,
  VenueLocationFields,
  VenueNotesFields,
  VenuePolicyFields,
} from "./venue-form-sections";

type VenueFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: VenueFormValues;
  onSubmit: (values: VenueFormValues) => Promise<unknown>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  submittingKey: TranslationKey;
  successKey: TranslationKey;
};

export function VenueForm(props: VenueFormProps) {
  const { t } = useTranslation();
  const form = useVenueForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (await form.submit()) props.onSuccess?.();
    } catch {
      return;
    }
  };

  return (
    <form
      className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6"
      onSubmit={submit}
    >
      <VenueCoreFields form={form} />
      <VenueLocationFields form={form} />
      <VenuePolicyFields form={form} />
      <VenueContactFields form={form} />
      <VenueNotesFields form={form} />

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? (
            <span className="text-emerald-300">{t(props.successKey)}</span>
          ) : null}
          {props.status === "error" ? (
            <span className="text-rose-300">{t(props.errorKey)}</span>
          ) : null}
        </p>
        <div className="flex gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
            href={props.cancelHref}
          >
            {t("crm.venue.action.cancel")}
          </Link>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950 disabled:opacity-60"
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
