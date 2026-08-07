"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { CrmTextInput } from "../../shared/components/crm-text-input";
import { PhoneInput } from "../../shared/components/phone-input";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { staffBankOptions, staffIdTypeOptions } from "../constants/staff-options";
import { useStaffForm } from "../hooks/use-staff-form";
import type { StaffFormValues } from "../types/staff";
import { StaffFormSection } from "./staff-form-section";

type StaffFormProps = {
  cancelHref: string;
  errorKey: TranslationKey;
  initialValues: StaffFormValues;
  onSubmit: (values: StaffFormValues) => Promise<void>;
  onSuccess?: () => void;
  status: "idle" | "loading" | "success" | "error";
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

export function StaffForm(props: StaffFormProps) {
  const { t } = useTranslation();
  const form = useStaffForm(props.initialValues, props.onSubmit);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await form.submit()) props.onSuccess?.();
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <StaffFormSection title={t("crm.staff.section.personal")}>
        <div className="grid gap-5 md:grid-cols-2">
          <CrmTextInput error={form.errors.name} label={t("crm.staff.field.name")} onChange={(value) => form.setField("name", value)} t={t} value={form.values.name} />
          <CrmTextInput label={t("crm.staff.field.displayName")} onChange={(value) => form.setField("displayName", value)} t={t} value={form.values.displayName} />
          <CrmTextInput label={t("crm.staff.field.email")} onChange={(value) => form.setField("email", value)} t={t} type="email" value={form.values.email} />
          <PhoneInput error={form.errors.phone} label={t("crm.staff.field.phone")} onChange={(value) => form.setField("phone", value)} t={t} value={form.values.phone} />
          <CrmTextInput label={t("crm.staff.field.dateOfBirth")} onChange={(value) => form.setField("dateOfBirth", value)} t={t} type="date" value={form.values.dateOfBirth} />
        </div>
        <CrmTextarea label={t("crm.staff.field.address")} onChange={(value) => form.setField("address", value)} placeholder="" t={t} value={form.values.address} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
            <input checked={form.values.isDriver} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isDriver", event.target.checked)} type="checkbox" />
            {t("crm.staff.field.driver")}
          </label>
          <label className="flex items-center gap-3 text-sm font-bold text-zinc-200">
            <input checked={form.values.isActive} className="h-4 w-4 accent-cyan-300" onChange={(event) => form.setField("isActive", event.target.checked)} type="checkbox" />
            {t("crm.staff.field.active")}
          </label>
        </div>
      </StaffFormSection>
      <StaffFormSection title={t("crm.staff.section.ids")}>
        <div className="grid gap-5 md:grid-cols-2">
          <CrmSelect label={t("crm.staff.field.idType")} onChange={(value) => form.setField("idType", value)} options={staffIdTypeOptions} t={t} value={form.values.idType} />
          <CrmTextInput label={t("crm.staff.field.idNumber")} onChange={(value) => form.setField("idNumber", value)} t={t} value={form.values.idNumber} />
          <CrmTextInput label={t("crm.staff.field.idExpirationDate")} onChange={(value) => form.setField("idExpirationDate", value)} t={t} type="date" value={form.values.idExpirationDate} />
          <CrmTextInput label={t("crm.staff.field.idFrontFileUrl")} onChange={(value) => form.setField("idFrontFileUrl", value)} t={t} value={form.values.idFrontFileUrl} />
          <CrmTextInput label={t("crm.staff.field.idBackFileUrl")} onChange={(value) => form.setField("idBackFileUrl", value)} t={t} value={form.values.idBackFileUrl} />
        </div>
      </StaffFormSection>
      <StaffFormSection title={t("crm.staff.section.banking")}>
        <div className="grid gap-5 md:grid-cols-2">
          <CrmSelect label={t("crm.staff.field.bankName")} onChange={(value) => form.setField("bankName", value)} options={staffBankOptions} t={t} value={form.values.bankName} />
          <CrmTextInput label={t("crm.staff.field.bankBeneficiary")} onChange={(value) => form.setField("bankBeneficiary", value)} t={t} value={form.values.bankBeneficiary} />
          <CrmTextInput label={t("crm.staff.field.bankCardNumber")} onChange={(value) => form.setField("bankCardNumber", value)} t={t} value={form.values.bankCardNumber} />
          <CrmTextInput label={t("crm.staff.field.bankClabe")} onChange={(value) => form.setField("bankClabe", value)} t={t} value={form.values.bankClabe} />
          <CrmTextInput label={t("crm.staff.field.bankAccountNumber")} onChange={(value) => form.setField("bankAccountNumber", value)} t={t} value={form.values.bankAccountNumber} />
        </div>
      </StaffFormSection>
      <CrmTextarea label={t("crm.staff.field.notes")} onChange={(value) => form.setField("notes", value)} placeholder={t("crm.staff.placeholder.notes")} t={t} value={form.values.notes} />
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {props.status === "success" ? <span className="text-emerald-300">{t(props.successKey)}</span> : null}
          {props.status === "error" ? <span className="text-rose-300">{t(props.errorKey)}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href={props.cancelHref}>{t("crm.staff.action.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={form.isSubmitting} type="submit">
            <Save aria-hidden="true" size={16} />
            {t(props.submitKey)}
          </button>
        </div>
      </div>
    </form>
  );
}
