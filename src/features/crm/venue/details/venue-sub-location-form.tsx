"use client";

import { Save } from "lucide-react";
import type { FormEvent } from "react";

import { useTranslation } from "@/core/i18n";

import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { useVenueSubLocationForm } from "../hooks/use-venue-sub-location-form";
import type { VenueSubLocationFormValues } from "../types/venue-sub-location";

type VenueSubLocationFormProps = {
  initialValues: VenueSubLocationFormValues;
  onCancel?: () => void;
  onSubmit: (values: VenueSubLocationFormValues) => Promise<void>;
  submitLabel: string;
};

export function VenueSubLocationForm(props: VenueSubLocationFormProps) {
  const { t } = useTranslation();
  const form = useVenueSubLocationForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await form.submit();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-950/50 p-5" onSubmit={submit}>
      <CrmTextInput error={form.errors.name} label={t("crm.venue.subLocation.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
        {t("crm.venue.subLocation.field.active")}
      </label>
      <CrmTextarea label={t("crm.venue.subLocation.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("crm.venue.subLocation.placeholder.notes")} t={t} value={form.values.notes} />
      <div className="flex justify-end gap-3">
        {props.onCancel ? (
          <button className="h-11 rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" onClick={props.onCancel} type="button">
            {t("crm.venue.action.cancel")}
          </button>
        ) : null}
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
          <Save aria-hidden="true" size={16} />
          {props.submitLabel}
        </button>
      </div>
    </form>
  );
}
