"use client";

import { useEffect, useState } from "react";

import type { TranslationKey } from "@/core/i18n";
import { usePayrollTaskList } from "@/features/settings/payroll-task/hooks/use-payroll-task-list";

import { useStaffList } from "../../staff/hooks/use-staff-list";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import type { Translate } from "../../shared/types/form-types";
import { initialEventPayrollLineItemValues, validateEventPayrollLineItem, type EventPayrollLineItemErrors } from "../schemas/event-payroll-line-item-schema";
import type { EventPayrollLineItem, EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";

type EventPayrollLineItemFormProps = {
  editingItem: EventPayrollLineItem | null;
  onCancel: () => void;
  onSave: (values: EventPayrollLineItemFormValues, lineItemId?: string) => Promise<void>;
  t: Translate;
};

const statusOptions: { translationKey: TranslationKey; value: string }[] = [
  { translationKey: "crm.payroll.status.estimated", value: "estimated" },
  { translationKey: "crm.payroll.status.approved", value: "approved" },
  { translationKey: "crm.payroll.status.scheduled", value: "scheduled" },
  { translationKey: "crm.payroll.status.paid", value: "paid" },
  { translationKey: "crm.payroll.status.waived", value: "waived" },
];

const valuesFromItem = (item: EventPayrollLineItem): EventPayrollLineItemFormValues => ({
  eventStaffAssignmentId: item.eventStaffAssignmentId,
  manualAdjustmentMxn: item.manualAdjustmentMxn,
  notes: item.notes,
  payrollTaskId: item.payrollTaskId,
  quantity: item.quantity,
  staffMemberId: item.staffMemberId,
  status: item.status,
  tipsBonusMxn: item.tipsBonusMxn,
});

export function EventPayrollLineItemForm({ editingItem, onCancel, onSave, t }: EventPayrollLineItemFormProps) {
  const staff = useStaffList();
  const tasks = usePayrollTaskList();
  const [errors, setErrors] = useState<EventPayrollLineItemErrors>({});
  const [values, setValues] = useState(initialEventPayrollLineItemValues);

  useEffect(() => {
    setValues(editingItem ? valuesFromItem(editingItem) : initialEventPayrollLineItemValues);
    setErrors({});
  }, [editingItem]);

  const setField = (field: keyof EventPayrollLineItemFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async () => {
    const validation = validateEventPayrollLineItem(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await onSave(values, editingItem?.id);
  };

  const staffOptions = staff.staff.map((member) => ({
    label: member.displayName || member.name,
    value: member.id,
  }));
  const taskOptions = tasks.tasks.filter((task) => task.isActive || task.id === values.payrollTaskId).map((task) => ({
    label: task.name,
    value: task.id,
  }));

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <CrmSelect error={errors.staffMemberId} label={t("crm.payroll.field.staffMember")} onChange={(value) => setField("staffMemberId", value)} options={staffOptions} placeholderKey="crm.payroll.placeholder.staffMember" t={t} value={values.staffMemberId} />
        <CrmSelect error={errors.payrollTaskId} label={t("crm.payroll.field.task")} onChange={(value) => setField("payrollTaskId", value)} options={taskOptions} placeholderKey="crm.payroll.placeholder.task" t={t} value={values.payrollTaskId} />
        <CrmSelect label={t("crm.payroll.field.status")} onChange={(value) => setField("status", value)} options={statusOptions} t={t} value={values.status} />
        <CrmTextInput error={errors.quantity} label={t("crm.payroll.field.quantity")} onChange={(value) => setField("quantity", value)} t={t} type="number" value={values.quantity} />
        <CrmTextInput error={errors.manualAdjustmentMxn} label={t("crm.payroll.field.manualAdjustment")} onChange={(value) => setField("manualAdjustmentMxn", value)} t={t} type="number" value={values.manualAdjustmentMxn} />
        <CrmTextInput error={errors.tipsBonusMxn} label={t("crm.payroll.field.tipsBonus")} onChange={(value) => setField("tipsBonusMxn", value)} t={t} type="number" value={values.tipsBonusMxn} />
      </div>
      <div className="mt-4">
        <CrmTextarea label={t("crm.payroll.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("crm.payroll.placeholder.notes")} t={t} value={values.notes} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="h-11 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" onClick={submit} type="button">{t("crm.payroll.action.save")}</button>
        <button className="h-11 rounded-md border border-zinc-700 px-5 text-sm font-bold text-zinc-200" onClick={onCancel} type="button">{t("crm.payroll.action.cancel")}</button>
      </div>
    </div>
  );
}
