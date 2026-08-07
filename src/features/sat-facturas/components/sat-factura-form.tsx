"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { useTranslation, type TranslationKey } from "@/core/i18n";
import { useEvents } from "@/features/crm/event/hooks/use-events";
import { CrmSelect } from "@/features/crm/shared/components/crm-select";
import { CrmTextInput } from "@/features/crm/shared/components/crm-text-input";
import { CrmTextarea } from "@/features/crm/shared/components/crm-textarea";

import {
  cfdiUseOptions,
  paymentFormOptions,
  paymentMethodOptions,
  taxObjectOptions,
  taxRegimeOptions,
} from "../constants/sat-catalog-options";
import { useSatSettings } from "../hooks/use-sat-settings";
import {
  validateSatFactura,
  type SatFacturaFormErrors,
} from "../schemas/sat-factura-schema";
import type {
  SatFacturaEventDefaults,
  SatFacturaFormValues,
} from "../types/sat-factura";
import { SatFacturaFormActions } from "./sat-factura-form-actions";
import { SatRetentionFields } from "./sat-retention-fields";
import { buildSatAccountantRequest } from "../utils/sat-accountant-request";
import { calculateSatFactura } from "../utils/sat-factura-calculations";
import {
  calculateIsrRetention,
  calculateIvaRetention,
  hasSatAmount,
} from "../utils/sat-retention-calculations";

type SatFacturaFormProps = {
  enableEventDefaults?: boolean;
  errorKey: TranslationKey;
  initialValues: SatFacturaFormValues;
  onSubmit: (values: SatFacturaFormValues) => Promise<void>;
  onSuccess?: () => void;
  submitKey: TranslationKey;
  successKey: TranslationKey;
};

const recipientOptions = [
  { translationKey: "satFacturas.recipient.client", value: "client" },
  { translationKey: "satFacturas.recipient.venue_hotel", value: "venue_hotel" },
  { translationKey: "satFacturas.recipient.other", value: "other" },
] as const;

export function SatFacturaForm(props: SatFacturaFormProps) {
  const { t } = useTranslation();
  const eventState = useEvents();
  const settings = useSatSettings();
  const [errors, setErrors] = useState<SatFacturaFormErrors>({});
  const [defaultsEventId, setDefaultsEventId] = useState("");
  const generatedAccountantRequest = useRef("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [values, setValues] = useState(props.initialValues);

  useEffect(() => {
    if (props.enableEventDefaults === false) return;
    if (!values.eventId || values.eventId === defaultsEventId) return;

    let isMounted = true;
    void fetch(`/api/sat-facturas/events/${values.eventId}/defaults`)
      .then((response) => {
        if (!response.ok) throw new Error("sat_factura_defaults_failed");
        return response.json() as Promise<{ data: SatFacturaEventDefaults }>;
      })
      .then((payload) => {
        if (!isMounted) return;
        setValues((current) => mergeDefaults(current, payload.data));
        setDefaultsEventId(values.eventId);
      })
      .catch(() => {
        if (isMounted) setDefaultsEventId(values.eventId);
      });

    return () => {
      isMounted = false;
    };
  }, [defaultsEventId, props.enableEventDefaults, values.eventId]);

  useEffect(() => {
    const calculated = calculateSatFactura(values);
    setValues((current) => {
      const matches = current.taxTotalMxn === calculated.taxTotalMxn
        && current.totalMxn === calculated.totalMxn
        && current.unitValueMxn === calculated.unitValueMxn;

      return matches ? current : { ...current, ...calculated };
    });
  }, [values.subtotalMxn, values.ivaMxn, values.ivaRetentionMxn, values.isrRetentionMxn, values.pax]);

  useEffect(() => {
    setValues((current) => {
      const ivaRetention = hasSatAmount(current.ivaRetentionMxn)
        ? calculateIvaRetention(current.subtotalMxn)
        : current.ivaRetentionMxn;
      const isrRetention = hasSatAmount(current.isrRetentionMxn)
        ? calculateIsrRetention(current.subtotalMxn)
        : current.isrRetentionMxn;
      const matches =
        current.ivaRetentionMxn === ivaRetention &&
        current.isrRetentionMxn === isrRetention;

      return matches
        ? current
        : { ...current, isrRetentionMxn: isrRetention, ivaRetentionMxn: ivaRetention };
    });
  }, [values.subtotalMxn]);

  const selectedEvent = eventState.events.find((event) => event.eventId === values.eventId);
  const selectedProfile = settings.settings?.fiscalProfiles.find(
    (profile) => profile.id === values.fiscalProfileId,
  );

  useEffect(() => {
    const generated = buildSatAccountantRequest(values, selectedEvent, selectedProfile);

    setValues((current) => {
      const canRefresh =
        !current.accountantRequestText.trim() ||
        current.accountantRequestText === generatedAccountantRequest.current;

      if (!canRefresh || current.accountantRequestText === generated) {
        return current;
      }

      generatedAccountantRequest.current = generated;
      return { ...current, accountantRequestText: generated };
    });
  }, [
    selectedEvent,
    selectedProfile,
    values.ivaRetentionMxn,
    values.isrRetentionMxn,
    values.pax,
    values.recipientName,
    values.rfc,
    values.serviceDescription,
    values.subtotalMxn,
  ]);

  const setField = <TKey extends keyof SatFacturaFormValues>(
    key: TKey,
    value: SatFacturaFormValues[TKey],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const eventOptions = eventState.events.map((event) => ({
    label: `${event.clientName} - ${event.eventDate} - ${event.venueName}`,
    value: event.eventId,
  }));
  const profileOptions = (settings.settings?.fiscalProfiles ?? []).map((profile) => ({
    label: `${profile.label} - ${profile.rfc || t("common.notProvided")}`,
    value: profile.id,
  }));
  const accountOptions = (settings.settings?.bankAccounts ?? []).map((account) => ({
    label: `${account.nickname} - ${account.bankName || t("common.notProvided")}`,
    value: account.id,
  }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateSatFactura(values);
    setErrors(validation.errors);
    if (!validation.isValid) return;

    setStatus("loading");
    try {
      await props.onSubmit(values);
      setStatus("success");
      props.onSuccess?.();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="space-y-5 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6" onSubmit={submit}>
      <div className="grid gap-5 md:grid-cols-2">
        <CrmSelect error={errors.eventId} label={t("satFacturas.field.event")} onChange={(value) => setField("eventId", value)} options={eventOptions} t={t} value={values.eventId} />
        <CrmSelect label={t("satFacturas.field.recipient")} onChange={(value) => setField("recipientType", value as SatFacturaFormValues["recipientType"])} options={[...recipientOptions]} t={t} value={values.recipientType} />
        <CrmTextInput error={errors.recipientName} label={t("satFacturas.field.recipientName")} onChange={(value) => setField("recipientName", value)} t={t} value={values.recipientName} />
        <CrmTextInput error={errors.rfc} label={t("satFacturas.field.rfc")} onChange={(value) => setField("rfc", value)} t={t} value={values.rfc} />
        <CrmSelect error={errors.taxRegime} label={t("satFacturas.field.taxRegime")} onChange={(value) => setField("taxRegime", value)} options={taxRegimeOptions} t={t} value={values.taxRegime} />
        <CrmSelect error={errors.cfdiUse} label={t("satFacturas.field.cfdiUse")} onChange={(value) => setField("cfdiUse", value)} options={cfdiUseOptions} t={t} value={values.cfdiUse} />
        <CrmSelect error={errors.paymentMethod} label={t("satFacturas.field.paymentMethod")} onChange={(value) => setField("paymentMethod", value)} options={paymentMethodOptions} t={t} value={values.paymentMethod} />
        <CrmSelect error={errors.paymentForm} label={t("satFacturas.field.paymentForm")} onChange={(value) => setField("paymentForm", value)} options={paymentFormOptions} t={t} value={values.paymentForm} />
        <CrmSelect error={errors.taxObject} label={t("satFacturas.field.taxObject")} onChange={(value) => setField("taxObject", value)} options={taxObjectOptions} t={t} value={values.taxObject} />
        <CrmSelect label={t("satFacturas.settings.field.profile")} onChange={(value) => setField("fiscalProfileId", value)} options={profileOptions} t={t} value={values.fiscalProfileId} />
        <CrmSelect label={t("satFacturas.settings.bankAccounts")} onChange={(value) => setField("bankAccountId", value)} options={accountOptions} t={t} value={values.bankAccountId} />
        <CrmTextInput label={t("satFacturas.field.dueDate")} onChange={(value) => setField("dueAt", value)} t={t} type="date" value={values.dueAt} />
        <CrmTextInput label={t("satFacturas.field.exchangeRate")} onChange={(value) => setField("exchangeRateToMxn", value)} t={t} type="number" value={values.exchangeRateToMxn} />
        <CrmTextInput label={t("satFacturas.field.exchangeRateSource")} onChange={(value) => setField("exchangeRateSource", value)} t={t} value={values.exchangeRateSource} />
        <CrmTextInput label={t("satFacturas.field.serviceDescription")} onChange={(value) => setField("serviceDescription", value)} t={t} value={values.serviceDescription} />
        <CrmTextInput label={t("satFacturas.field.pax")} onChange={(value) => setField("pax", value)} t={t} type="number" value={values.pax} />
        <CrmTextInput label={t("satFacturas.field.unitValue")} onChange={(value) => setField("unitValueMxn", value)} t={t} type="number" value={values.unitValueMxn} />
        <CrmTextInput error={errors.subtotalMxn} label={t("satFacturas.field.subtotal")} onChange={(value) => setField("subtotalMxn", value)} t={t} type="number" value={values.subtotalMxn} />
        <CrmTextInput label={t("satFacturas.field.iva")} onChange={(value) => setField("ivaMxn", value)} t={t} type="number" value={values.ivaMxn} />
        <SatRetentionFields onChange={setField} t={t} values={values} />
        <CrmTextInput error={errors.taxTotalMxn} label={t("satFacturas.field.tax")} onChange={(value) => setField("taxTotalMxn", value)} t={t} type="number" value={values.taxTotalMxn} />
        <CrmTextInput error={errors.totalMxn} label={t("satFacturas.field.total")} onChange={(value) => setField("totalMxn", value)} t={t} type="number" value={values.totalMxn} />
      </div>
      <CrmTextarea label={t("satFacturas.field.accountantRequest")} onChange={(value) => setField("accountantRequestText", value)} placeholder={t("satFacturas.placeholder.accountantRequest")} t={t} value={values.accountantRequestText} />
      <CrmTextarea label={t("satFacturas.field.notes")} onChange={(value) => setField("notes", value)} placeholder={t("satFacturas.placeholder.notes")} t={t} value={values.notes} />
      <SatFacturaFormActions errorKey={props.errorKey} status={status} submitKey={props.submitKey} successKey={props.successKey} t={t} />
    </form>
  );
}

function mergeDefaults(
  current: SatFacturaFormValues,
  defaults: SatFacturaEventDefaults,
): SatFacturaFormValues {
  return (Object.keys(defaults) as (keyof SatFacturaFormValues)[]).reduce(
    (next, key) => {
      const value = defaults[key];
      if (key === "accountantRequestText") return next;
      return typeof value === "string" && value ? { ...next, [key]: value } : next;
    },
    current,
  );
}
