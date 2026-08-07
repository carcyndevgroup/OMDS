"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  initialEventCommissionValues,
  validateEventCommission,
  type EventCommissionErrors,
} from "../schemas/event-commission-schema";
import type {
  EventCommission,
  EventCommissionFormValues,
} from "../types/event-commission";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import type { Translate } from "../../shared/types/form-types";
import { EventCommissionForm } from "./event-commission-form";

type EventCommissionsSectionProps = {
  commissions: EventCommission[];
  hasError: boolean;
  isLoading: boolean;
  onRemove: (commissionId: string) => Promise<void>;
  onSave: (
    values: EventCommissionFormValues,
    commissionId?: string,
  ) => Promise<void>;
  t: Translate;
};

const typeKeys = {
  other: "crm.commission.type.other",
  planner: "crm.commission.type.planner",
  venue_hotel: "crm.commission.type.venueHotel",
} as const;

const modelKeys = {
  fixed_amount: "crm.commission.model.fixedAmount",
  fixed_percentage: "crm.commission.model.fixedPercentage",
  manual: "crm.commission.model.manual",
} as const;

const statusKeys = {
  approved: "crm.commission.status.approved",
  estimated: "crm.commission.status.estimated",
  paid: "crm.commission.status.paid",
  waived: "crm.commission.status.waived",
} as const;

const valuesFromCommission = (
  commission: EventCommission,
): EventCommissionFormValues => ({
  amountMxn: commission.amountMxn,
  baseAmountMxn: commission.baseAmountMxn,
  calculationModel: commission.calculationModel,
  commissionType: commission.commissionType,
  notes: commission.notes,
  payeeName: commission.payeeName,
  percentage: commission.percentage || "0",
  relatedPlannerId: commission.relatedPlannerId ?? "",
  relatedVenueId: commission.relatedVenueId ?? "",
  status: commission.status,
});

export function EventCommissionsSection({
  commissions,
  hasError,
  isLoading,
  onRemove,
  onSave,
  t,
}: EventCommissionsSectionProps) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [errors, setErrors] = useState<EventCommissionErrors>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [values, setValues] = useState(initialEventCommissionValues);

  const reset = () => {
    setEditingId(undefined);
    setErrors({});
    setIsFormOpen(false);
    setValues(initialEventCommissionValues);
  };

  const submit = async () => {
    const validation = validateEventCommission(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;
    await onSave(values, editingId);
    reset();
  };

  const edit = (commission: EventCommission) => {
    setEditingId(commission.id);
    setValues(valuesFromCommission(commission));
    setErrors({});
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-zinc-500">{t("crm.commission.total")}</span>
        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950" onClick={() => setIsFormOpen(true)} type="button">
          <Plus aria-hidden="true" size={16} />
          {t("crm.commission.action.add")}
        </button>
      </div>
      {isFormOpen ? (
        <EventCommissionForm errors={errors} onCancel={reset} onChange={setValues} onSubmit={submit} t={t} values={values} />
      ) : null}
      {isLoading ? <p className="text-sm text-zinc-500">{t("crm.commission.loading")}</p> : null}
      {hasError ? <p className="text-sm text-rose-300">{t("crm.commission.loadError")}</p> : null}
      {!isLoading && !commissions.length ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.commission.empty")}</p>
      ) : null}
      <div className="grid gap-3">
        {commissions.map((commission) => (
          <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={commission.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-cyan-200">{commission.payeeName}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">
                  {t(typeKeys[commission.commissionType])} · {t(statusKeys[commission.status])}
                </p>
              </div>
              <p className="text-lg font-black text-white">{formatMoneyMxn(commission.amountMxn)}</p>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              {t(modelKeys[commission.calculationModel])}
              {commission.percentage ? ` · ${commission.percentage}%` : ""}
            </p>
            {commission.notes ? <p className="mt-2 text-sm text-zinc-400">{commission.notes}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200" onClick={() => edit(commission)} type="button">
                <Pencil aria-hidden="true" size={16} />
                {t("crm.commission.action.edit")}
              </button>
              <button className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-400/40 px-3 text-sm font-bold text-rose-200" onClick={() => onRemove(commission.id)} type="button">
                <Trash2 aria-hidden="true" size={16} />
                {t("crm.commission.action.remove")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
