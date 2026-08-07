"use client";

import { Save } from "lucide-react";
import type { FormEvent } from "react";

import { useTranslation } from "@/core/i18n";

import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import {
  venueContactMethodOptions,
  venueContactRoleOptions,
} from "../constants/venue-contact-options";
import { useVenueContactForm } from "../hooks/use-venue-contact-form";
import type { VenueContactFormValues } from "../types/venue-contact";

type VenueContactFormProps = {
  initialValues: VenueContactFormValues;
  onCancel?: () => void;
  onSubmit: (values: VenueContactFormValues) => Promise<void>;
  submitLabel: string;
};

export function VenueContactForm(props: VenueContactFormProps) {
  const { t } = useTranslation();
  const form = useVenueContactForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await form.submit();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-950/50 p-5" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={form.errors.name} label={t("crm.venue.contact.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
        <CrmSelect error={form.errors.role} label={t("crm.venue.contact.field.role")} onChange={(value) => form.setField("role", value)} options={venueContactRoleOptions} t={t} value={form.values.role} />
        <CrmTextInput label={t("crm.venue.contact.field.email")} onChange={(value) => form.setField("email", value)} t={t} type="email" value={form.values.email} />
        <CrmTextInput label={t("crm.venue.contact.field.phone")} onChange={(value) => form.setField("phone", value)} t={t} value={form.values.phone} />
        <CrmTextInput label={t("crm.venue.contact.field.whatsapp")} onChange={(value) => form.setField("whatsapp", value)} t={t} value={form.values.whatsapp} />
        <CrmSelect label={t("crm.venue.contact.field.preferredMethod")} onChange={(value) => form.setField("preferredContactMethod", value)} options={venueContactMethodOptions} t={t} value={form.values.preferredContactMethod} />
      </div>
      <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
        <input
          checked={form.values.isActive}
          className="h-4 w-4 accent-cyan-300"
          onChange={(event) => form.setField("isActive", event.target.checked)}
          type="checkbox"
        />
        {t("crm.venue.contact.field.active")}
      </label>
      <CrmTextarea label={t("crm.venue.contact.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("crm.venue.contact.placeholder.notes")} t={t} value={form.values.notes} />
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
