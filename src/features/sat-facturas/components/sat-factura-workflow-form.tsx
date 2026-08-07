"use client";

import { Save } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";

import {
  complementoStatusOptions,
  statusOptions,
  validateWorkflow,
  type SatWorkflowErrors,
} from "../schemas/sat-workflow-schema";
import type { SatFacturaWorkflowValues } from "../types/sat-factura";

type SatFacturaWorkflowFormProps = {
  initialValues: SatFacturaWorkflowValues;
  onSubmit: (values: SatFacturaWorkflowValues) => Promise<void>;
  onSuccess: () => void;
};

export function SatFacturaWorkflowForm({
  initialValues,
  onSubmit,
  onSuccess,
}: SatFacturaWorkflowFormProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<SatWorkflowErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [values, setValues] = useState(initialValues);

  const setField = <TKey extends keyof SatFacturaWorkflowValues>(
    key: TKey,
    value: SatFacturaWorkflowValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateWorkflow(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setStatus("loading");
    try {
      await onSubmit(values);
      setStatus("success");
      onSuccess();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmSelect error={errors.status} label={t("satFacturas.field.status")} onChange={(value) => setField("status", value as SatFacturaWorkflowValues["status"])} options={[...statusOptions]} t={t} value={values.status} />
        <CrmTextInput label={t("satFacturas.field.accountantRequestedAt")} onChange={(value) => setField("accountantRequestedAt", value)} t={t} type="date" value={values.accountantRequestedAt} />
        <CrmTextInput label={t("satFacturas.field.facturaNumber")} onChange={(value) => setField("facturaNumber", value)} t={t} value={values.facturaNumber} />
        <CrmTextInput label={t("satFacturas.field.uuid")} onChange={(value) => setField("uuidFiscal", value)} t={t} value={values.uuidFiscal} />
        <CrmTextInput label={t("satFacturas.field.issuedAt")} onChange={(value) => setField("issuedAt", value)} t={t} type="date" value={values.issuedAt} />
        <CrmTextInput label={t("satFacturas.field.sentToVenue")} onChange={(value) => setField("sentToVenueAt", value)} t={t} type="date" value={values.sentToVenueAt} />
        <CrmTextInput label={t("satFacturas.field.paidAt")} onChange={(value) => setField("paidAt", value)} t={t} type="date" value={values.paidAt} />
        <CrmTextInput label={t("satFacturas.field.facturaPdf")} onChange={(value) => setField("facturaPdfUrl", value)} t={t} value={values.facturaPdfUrl} />
        <CrmTextInput label={t("satFacturas.field.facturaXml")} onChange={(value) => setField("facturaXmlUrl", value)} t={t} value={values.facturaXmlUrl} />
        <CrmSelect error={errors.complementoStatus} label={t("satFacturas.field.complemento")} onChange={(value) => setField("complementoStatus", value)} options={[...complementoStatusOptions]} t={t} value={values.complementoStatus} />
        <CrmTextInput label={t("satFacturas.field.complementoRequestedAt")} onChange={(value) => setField("complementoRequestedAt", value)} t={t} type="date" value={values.complementoRequestedAt} />
        <CrmTextInput label={t("satFacturas.field.complementoReceivedAt")} onChange={(value) => setField("complementoReceivedAt", value)} t={t} type="date" value={values.complementoReceivedAt} />
        <CrmTextInput label={t("satFacturas.field.complementoSentAt")} onChange={(value) => setField("complementoSentAt", value)} t={t} type="date" value={values.complementoSentAt} />
        <CrmTextInput label={t("satFacturas.field.complementoPdf")} onChange={(value) => setField("complementoPdfUrl", value)} t={t} value={values.complementoPdfUrl} />
        <CrmTextInput label={t("satFacturas.field.complementoXml")} onChange={(value) => setField("complementoXmlUrl", value)} t={t} value={values.complementoXmlUrl} />
      </div>

      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" className="min-h-5 text-sm font-medium">
          {status === "success" ? <span className="text-emerald-300">{t("satFacturas.workflow.success")}</span> : null}
          {status === "error" ? <span className="text-rose-300">{t("satFacturas.workflow.error")}</span> : null}
        </p>
        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-5 text-sm font-bold text-zinc-950" disabled={status === "loading"} type="submit">
          <Save aria-hidden="true" size={16} />
          {t("satFacturas.workflow.action.save")}
        </button>
      </div>
    </form>
  );
}
