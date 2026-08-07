"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { TranslationKey } from "@/core/i18n";
import { eventStaffPositionOptions } from "../../staff/constants/staff-options";
import { useEventStaff } from "../../staff/hooks/use-event-staff";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import type { Translate } from "../../shared/types/form-types";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import {
  initialEventStaffPayrollValues,
  validateEventStaffPayroll,
  type EventStaffPayrollErrors,
} from "../schemas/event-staff-payroll-schema";
import type {
  EventStaffPayroll,
  EventStaffPayrollFormValues,
} from "../types/event-staff-payroll";

type EventStaffPayrollSectionProps = {
  eventId: string;
  hasError: boolean;
  isLoading: boolean;
  onRemove: (payrollId: string) => Promise<void>;
  onSave: (values: EventStaffPayrollFormValues) => Promise<void>;
  payroll: EventStaffPayroll[];
  t: Translate;
};

type PayrollSelectOption = { translationKey: TranslationKey; value: string };

const statusOptions: PayrollSelectOption[] = [
  { translationKey: "crm.payroll.status.estimated", value: "estimated" },
  { translationKey: "crm.payroll.status.approved", value: "approved" },
  { translationKey: "crm.payroll.status.paid", value: "paid" },
  { translationKey: "crm.payroll.status.waived", value: "waived" },
];

const statusKeys = {
  approved: "crm.payroll.status.approved",
  estimated: "crm.payroll.status.estimated",
  paid: "crm.payroll.status.paid",
  waived: "crm.payroll.status.waived",
} as const;

const valuesFromPayroll = (
  payroll: EventStaffPayroll,
): EventStaffPayrollFormValues => ({
  amountMxn: payroll.amountMxn,
  assignmentId: payroll.assignmentId,
  notes: payroll.notes,
  status: payroll.status,
});

export function EventStaffPayrollSection({
  eventId,
  hasError,
  isLoading,
  onRemove,
  onSave,
  payroll,
  t,
}: EventStaffPayrollSectionProps) {
  const eventStaff = useEventStaff(eventId);
  const [errors, setErrors] = useState<EventStaffPayrollErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [values, setValues] = useState(initialEventStaffPayrollValues);

  const setField = (field: keyof EventStaffPayrollFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const reset = () => {
    setErrors({});
    setIsFormOpen(false);
    setValues(initialEventStaffPayrollValues);
  };

  const submit = async () => {
    const validation = validateEventStaffPayroll(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await onSave(values);
    reset();
  };

  const assignmentOptions = eventStaff.assignments.map((assignment) => {
    const positionKey = eventStaffPositionOptions.find((option) => {
      return option.value === assignment.position;
    })?.translationKey;

    return {
      label: `${positionKey ? t(positionKey) : assignment.position} - ${assignment.staffName}`,
      value: assignment.id,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-zinc-500">{t("crm.payroll.total")}</span>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => setIsFormOpen(true)} type="button">
          <Plus aria-hidden="true" size={16} />
          {t("crm.payroll.action.add")}
        </button>
      </div>
      {isFormOpen ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <CrmSelect error={errors.assignmentId} label={t("crm.payroll.field.assignment")} onChange={(value) => setField("assignmentId", value)} options={assignmentOptions} placeholderKey="crm.payroll.placeholder.assignment" t={t} value={values.assignmentId} />
            <CrmTextInput error={errors.amountMxn} label={t("crm.payroll.field.amount")} onChange={(value) => setField("amountMxn", value)} t={t} type="number" value={values.amountMxn} />
            <CrmSelect label={t("crm.payroll.field.status")} onChange={(value) => setField("status", value)} options={statusOptions} t={t} value={values.status} />
          </div>
          <div className="mt-4">
            <CrmTextarea label={t("crm.payroll.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("crm.payroll.placeholder.notes")} t={t} value={values.notes} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={submit} type="button">{t("crm.payroll.action.save")}</button>
            <button className="h-11 rounded-md border border-zinc-700 px-5 text-sm font-bold text-zinc-200" onClick={reset} type="button">{t("crm.payroll.action.cancel")}</button>
          </div>
        </div>
      ) : null}
      {isLoading || eventStaff.isLoading ? <p className="text-sm text-zinc-500">{t("crm.payroll.loading")}</p> : null}
      {hasError || eventStaff.hasError ? <p className="text-sm text-rose-300">{t("crm.payroll.loadError")}</p> : null}
      {!isLoading && !payroll.length ? <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.payroll.empty")}</p> : null}
      <div className="grid gap-3">
        {payroll.map((item) => {
          const positionKey = eventStaffPositionOptions.find((option) => option.value === item.position)?.translationKey;
          return (
            <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={item.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-cyan-200">{item.staffName}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{positionKey ? t(positionKey) : item.position} · {t(statusKeys[item.status])}</p>
                </div>
                <p className="text-lg font-black text-white">{formatMoneyMxn(item.amountMxn)}</p>
              </div>
              {item.notes ? <p className="mt-2 text-sm text-zinc-400">{item.notes}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => { setValues(valuesFromPayroll(item)); setIsFormOpen(true); }} type="button">
                  <Pencil aria-hidden="true" size={16} />
                  {t("crm.commission.action.edit")}
                </button>
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-400/40 px-3 text-sm font-bold text-rose-200" onClick={() => onRemove(item.id)} type="button">
                  <Trash2 aria-hidden="true" size={16} />
                  {t("crm.payroll.action.remove")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
