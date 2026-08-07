"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import {
  initialSatPaymentValues,
  validateSatPayment,
  type SatPaymentErrors,
} from "../schemas/sat-payment-schema";
import type { SatFacturaQueueItem, SatPaymentFormValues } from "../types/sat-factura";
import type { SatBankAccount } from "../types/sat-settings";

type SatPaymentFormProps = {
  bankAccounts: SatBankAccount[];
  facturas: SatFacturaQueueItem[];
  onSubmit: (values: SatPaymentFormValues) => Promise<void>;
};

const payableStatuses = new Set(["issued", "sent_to_venue", "partially_paid"]);

export function SatPaymentForm({ bankAccounts, facturas, onSubmit }: SatPaymentFormProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<SatPaymentErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [values, setValues] = useState(initialSatPaymentValues);
  const eligibleFacturas = useMemo(
    () => facturas.filter((factura) => payableStatuses.has(factura.status)),
    [facturas],
  );
  const allocationTotal = values.allocations.reduce(
    (total, allocation) => total + Number(allocation.amountMxn || 0),
    0,
  );

  const setField = <TKey extends keyof SatPaymentFormValues>(
    key: TKey,
    value: SatPaymentFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const toggleFactura = (factura: SatFacturaQueueItem) => {
    setField("allocations", values.allocations.some((item) => item.facturaId === factura.id)
      ? values.allocations.filter((item) => item.facturaId !== factura.id)
      : [...values.allocations, { amountMxn: factura.totalMxn, facturaId: factura.id }]);
    if (!values.venueId && factura.venueId) setField("venueId", factura.venueId);
  };

  const setAllocationAmount = (facturaId: string, amountMxn: string) => {
    setField("allocations", values.allocations.map((allocation) =>
      allocation.facturaId === facturaId ? { ...allocation, amountMxn } : allocation,
    ));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateSatPayment(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setStatus("loading");
    try {
      await onSubmit(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmTextInput error={errors.paymentDate} label={t("satFacturas.field.paymentDate")} onChange={(value) => setField("paymentDate", value)} t={t} type="date" value={values.paymentDate} />
        <CrmTextInput error={errors.amountMxn} label={t("satFacturas.field.paymentAmount")} onChange={(value) => setField("amountMxn", value)} t={t} type="number" value={values.amountMxn} />
        <CrmSelect label={t("satFacturas.settings.field.bankAccount")} onChange={(value) => setField("bankAccountId", value)} options={bankAccounts.map((account) => ({ label: account.nickname, value: account.id }))} t={t} value={values.bankAccountId} />
        <CrmTextInput label={t("satFacturas.payment.reference")} onChange={(value) => setField("reference", value)} t={t} value={values.reference} />
        <CrmTextInput label={t("satFacturas.field.proofFile")} onChange={(value) => setField("proofFileUrl", value)} t={t} value={values.proofFileUrl} />
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-black">{t("satFacturas.payment.facturas")}</h2>
          <p className="text-sm font-bold text-cyan-200">
            {t("satFacturas.payment.allocation")}: {formatMoneyMxn(allocationTotal)}
          </p>
        </div>
        {errors.allocations ? <p className="text-sm font-bold text-rose-300">{t(errors.allocations)}</p> : null}
        {!eligibleFacturas.length ? <p className="rounded-md border border-dashed border-zinc-800 py-10 text-center text-sm font-bold text-zinc-500">{t("satFacturas.payment.empty")}</p> : null}
        <div className="space-y-3">
          {eligibleFacturas.map((factura) => (
            <FacturaAllocationRow
              factura={factura}
              key={factura.id}
              onAmountChange={setAllocationAmount}
              onToggle={toggleFactura}
              value={values.allocations.find((allocation) => allocation.facturaId === factura.id)?.amountMxn ?? ""}
            />
          ))}
        </div>
      </section>

      <CrmTextarea label={t("satFacturas.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("satFacturas.placeholder.notes")} t={t} value={values.notes} />

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {status === "success" ? <span className="text-emerald-300">{t("satFacturas.payment.success")}</span> : null}
          {status === "error" ? <span className="text-rose-300">{t("satFacturas.payment.error")}</span> : null}
        </p>
        <div className="flex gap-3">
          <Link className="inline-flex h-11 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200" href="/sat-facturas">{t("common.cancel")}</Link>
          <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={status === "loading"} type="submit">
            <Save aria-hidden="true" size={16} />
            {t("satFacturas.payment.action.create")}
          </button>
        </div>
      </div>
    </form>
  );
}

function FacturaAllocationRow({
  factura,
  onAmountChange,
  onToggle,
  value,
}: {
  factura: SatFacturaQueueItem;
  onAmountChange: (facturaId: string, amountMxn: string) => void;
  onToggle: (factura: SatFacturaQueueItem) => void;
  value: string;
}) {
  const selected = Boolean(value);
  return (
    <label className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-4 md:grid-cols-[1fr_180px] md:items-center">
      <span className="flex min-w-0 items-start gap-3">
        <input checked={selected} className="mt-1 h-4 w-4 accent-cyan-300" onChange={() => onToggle(factura)} type="checkbox" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-cyan-200">{factura.clientName}</span>
          <span className="mt-1 block truncate text-xs font-bold uppercase tracking-wide text-zinc-500">{factura.venueName}</span>
          <span className="mt-1 block text-sm font-bold text-zinc-300">{formatMoneyMxn(factura.totalMxn)}</span>
        </span>
      </span>
      <input
        className="h-10 rounded-md border border-zinc-700 bg-zinc-950/70 px-3 text-sm font-bold text-white outline-none focus:border-cyan-300"
        disabled={!selected}
        onChange={(event) => onAmountChange(factura.id, event.target.value)}
        type="number"
        value={value}
      />
    </label>
  );
}
