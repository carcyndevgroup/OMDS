"use client";

import type { TranslationKey } from "@/core/i18n";

import type { Translate } from "../../shared/types/form-types";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import {
  invoiceBehaviorOptions,
  paymentResponsibilityOptions,
} from "../../venue/constants/venue-settings-options";
import { useEventSatFacturas } from "../hooks/use-event-sat-facturas";

type EventSatFacturaSectionProps = {
  eventId: string;
  facturaRecipient: string;
  invoiceBehavior: string;
  t: Translate;
};

const statusKeys = {
  accountant_requested: "crm.sat.status.accountantRequested",
  cancelled: "crm.sat.status.cancelled",
  issued: "crm.sat.status.issued",
  paid: "crm.sat.status.paid",
  partially_paid: "crm.sat.status.partiallyPaid",
  pending: "crm.sat.status.pending",
  requested: "crm.sat.status.requested",
  sent_to_venue: "crm.sat.status.sentToVenue",
} as const satisfies Record<string, TranslationKey>;

export function EventSatFacturaSection({
  eventId,
  facturaRecipient,
  invoiceBehavior,
  t,
}: EventSatFacturaSectionProps) {
  const facturas = useEventSatFacturas(eventId);
  const recipientKey = paymentResponsibilityOptions.find((option) => {
    return option.value === facturaRecipient;
  })?.translationKey;
  const invoiceKey = invoiceBehaviorOptions.find((option) => {
    return option.value === invoiceBehavior;
  })?.translationKey;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <ReadOnlyField label={t("crm.sat.field.venueRule")} value={recipientKey ? t(recipientKey) : t("crm.invoice.empty")} />
        <ReadOnlyField label={t("crm.sat.field.invoiceBehavior")} value={invoiceKey ? t(invoiceKey) : t("crm.invoice.empty")} />
      </div>
      {facturas.isLoading ? <p className="text-sm text-zinc-500">{t("crm.sat.loading")}</p> : null}
      {facturas.hasError ? <p className="text-sm text-rose-300">{t("crm.sat.loadError")}</p> : null}
      {!facturas.isLoading && !facturas.facturas.length ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">{t("crm.sat.empty")}</p>
      ) : null}
      <div className="grid gap-3">
        {facturas.facturas.map((factura) => (
          <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4" key={factura.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-bold text-cyan-200">{factura.recipientName || t("crm.sat.field.recipient")}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-600">{t(statusKeys[factura.status])}</p>
              </div>
              <p className="text-lg font-black text-white">{formatMoneyMxn(factura.totalMxn)}</p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-400 md:grid-cols-3">
              <span>{t("crm.sat.field.facturaNumber")}: {factura.facturaNumber || "-"}</span>
              <span>{t("crm.sat.field.rfc")}: {factura.rfc || "-"}</span>
              <span>{t("crm.quote.total.tax")}: {formatMoneyMxn(factura.taxTotalMxn)}</span>
            </div>
            {factura.notes ? <p className="mt-3 text-sm text-zinc-500">{factura.notes}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function ReadOnlyField(props: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4">
      <p className="text-xs font-bold uppercase text-zinc-500">{props.label}</p>
      <p className="mt-2 font-bold text-zinc-100">{props.value}</p>
    </div>
  );
}
