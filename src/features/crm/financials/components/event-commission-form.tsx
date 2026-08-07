"use client";

import type { EventCommissionErrors } from "../schemas/event-commission-schema";
import type { EventCommissionFormValues } from "../types/event-commission";
import type { TranslationKey } from "@/core/i18n";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import type { Translate } from "../../shared/types/form-types";

type EventCommissionFormProps = {
  errors: EventCommissionErrors;
  onCancel: () => void;
  onChange: (values: EventCommissionFormValues) => void;
  onSubmit: () => void;
  t: Translate;
  values: EventCommissionFormValues;
};

type CommissionSelectOption = { translationKey: TranslationKey; value: string };

const typeOptions: CommissionSelectOption[] = [
  { translationKey: "crm.commission.type.venueHotel", value: "venue_hotel" },
  { translationKey: "crm.commission.type.planner", value: "planner" },
  { translationKey: "crm.commission.type.other", value: "other" },
];

const modelOptions: CommissionSelectOption[] = [
  { translationKey: "crm.commission.model.fixedPercentage", value: "fixed_percentage" },
  { translationKey: "crm.commission.model.fixedAmount", value: "fixed_amount" },
  { translationKey: "crm.commission.model.manual", value: "manual" },
];

const statusOptions: CommissionSelectOption[] = [
  { translationKey: "crm.commission.status.estimated", value: "estimated" },
  { translationKey: "crm.commission.status.approved", value: "approved" },
  { translationKey: "crm.commission.status.paid", value: "paid" },
  { translationKey: "crm.commission.status.waived", value: "waived" },
];

export function EventCommissionForm({
  errors,
  onCancel,
  onChange,
  onSubmit,
  t,
  values,
}: EventCommissionFormProps) {
  const setField = (field: keyof EventCommissionFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };
  const usesPercentage = values.calculationModel === "fixed_percentage";

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <CrmSelect label={t("crm.commission.field.type")} onChange={(value) => setField("commissionType", value)} options={typeOptions} t={t} value={values.commissionType} />
        <CrmTextInput error={errors.payeeName} label={t("crm.commission.field.payee")} onChange={(value) => setField("payeeName", value)} t={t} value={values.payeeName} />
        <CrmSelect label={t("crm.commission.field.model")} onChange={(value) => setField("calculationModel", value)} options={modelOptions} t={t} value={values.calculationModel} />
        <CrmSelect label={t("crm.commission.field.status")} onChange={(value) => setField("status", value)} options={statusOptions} t={t} value={values.status} />
        <CrmTextInput error={errors.baseAmountMxn} label={t("crm.commission.field.baseAmount")} onChange={(value) => setField("baseAmountMxn", value)} t={t} type="number" value={values.baseAmountMxn} />
        {usesPercentage ? (
          <CrmTextInput error={errors.percentage} label={t("crm.commission.field.percentage")} onChange={(value) => setField("percentage", value)} t={t} type="number" value={values.percentage} />
        ) : (
          <CrmTextInput error={errors.amountMxn} label={t("crm.commission.field.amount")} onChange={(value) => setField("amountMxn", value)} t={t} type="number" value={values.amountMxn} />
        )}
      </div>
      <div className="mt-4">
        <CrmTextarea label={t("crm.commission.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("crm.commission.placeholder.notes")} t={t} value={values.notes} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={onSubmit} type="button">
          {t("crm.commission.action.save")}
        </button>
        <button className="h-11 rounded-md border border-zinc-700 px-5 text-sm font-bold text-zinc-200" onClick={onCancel} type="button">
          {t("crm.commission.action.cancel")}
        </button>
      </div>
    </div>
  );
}
