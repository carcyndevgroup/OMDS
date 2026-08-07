"use client";

import { ArrowLeft, ExternalLink, Pencil, Workflow } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Locale, TranslationKey } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";

import { useSatFactura } from "../hooks/use-sat-factura";
import type { SatFacturaDetail as SatFacturaDetailType } from "../types/sat-factura";
import { accountantRequestForDetail } from "../utils/sat-accountant-request-detail";
import { formatSatMxn } from "../utils/sat-money-format";
import { SatCopyButton } from "./sat-copy-button";
import { SatFacturaNextStep } from "./sat-factura-next-step";
import { SatFacturaQuickActions } from "./sat-factura-quick-actions";

type SatFacturaDetailProps = {
  facturaId: string;
};

const statusKeys: Record<SatFacturaDetailType["status"], TranslationKey> = {
  accountant_requested: "satFacturas.status.accountant_requested",
  cancelled: "satFacturas.status.cancelled",
  issued: "satFacturas.status.issued",
  paid: "satFacturas.status.paid",
  partially_paid: "satFacturas.status.partially_paid",
  pending: "satFacturas.status.pending",
  sent_to_venue: "satFacturas.status.sent_to_venue",
};

export function SatFacturaDetail({ facturaId }: SatFacturaDetailProps) {
  const { locale, t } = useTranslation();
  const state = useSatFactura(facturaId);

  if (state.isLoading) return <Shell>{t("satFacturas.loading")}</Shell>;
  if (state.hasError || !state.factura) return <Shell>{t("satFacturas.loadError")}</Shell>;

  const factura = state.factura;
  const accountantRequest = accountantRequestForDetail(factura);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/sat-facturas">
              <ArrowLeft aria-hidden="true" size={18} />
              {t("satFacturas.title")}
            </Link>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {factura.clientName || factura.recipientName || t("common.notProvided")}
            </h1>
            <p className="mt-2 text-base font-medium text-zinc-500">
              {t(statusKeys[factura.status])}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton href={`/sat-facturas/${factura.id}/workflow`} icon={Workflow} label={t("satFacturas.workflow.action.edit")} />
            <LinkButton href={`/sat-facturas/${factura.id}/edit`} icon={Pencil} label={t("satFacturas.action.edit")} />
            <LinkButton href={`/crm/events/${factura.eventId}`} icon={ExternalLink} label={t("nav.events")} />
          </div>
        </header>

        <SatFacturaNextStep factura={factura} t={t} />
        <SatFacturaQuickActions factura={factura} onUpdate={state.setFactura} t={t} />

        <section className="grid gap-4 lg:grid-cols-2">
          <DetailSection title={t("satFacturas.section.event")}>
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.client")} value={factura.clientName} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.eventDate")} value={formatDate(factura.eventDate, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.venue")} value={factura.venueName} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.dueDate")} value={formatDate(factura.dueAt, locale)} />
          </DetailSection>

          <DetailSection title={t("satFacturas.field.fiscalData")}>
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.recipient")} value={factura.recipientName} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.rfc")} value={factura.rfc} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.taxRegime")} value={factura.taxRegime} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.cfdiUse")} value={factura.cfdiUse} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.taxObject")} value={factura.taxObject} />
          </DetailSection>

          <DetailSection title={t("satFacturas.section.workflow")}>
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.facturaNumber")} value={factura.facturaNumber} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.uuid")} value={factura.uuidFiscal} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.accountantRequestedAt")} value={formatDateTime(factura.accountantRequestedAt, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.issuedAt")} value={formatDateTime(factura.issuedAt, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.sentToVenue")} value={formatDateTime(factura.sentToVenueAt, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.paidAt")} value={formatDateTime(factura.paidAt, locale)} />
            <FileField fallback={t("common.notProvided")} label={t("satFacturas.field.facturaPdf")} t={t} value={factura.facturaPdfUrl} />
            <FileField fallback={t("common.notProvided")} label={t("satFacturas.field.facturaXml")} t={t} value={factura.facturaXmlUrl} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.complemento")} value={factura.complementoStatus} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.complementoRequestedAt")} value={formatDateTime(factura.complementoRequestedAt, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.complementoReceivedAt")} value={formatDateTime(factura.complementoReceivedAt, locale)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.complementoSentAt")} value={formatDateTime(factura.complementoSentAt, locale)} />
            <FileField fallback={t("common.notProvided")} label={t("satFacturas.field.complementoPdf")} t={t} value={factura.complementoPdfUrl} />
            <FileField fallback={t("common.notProvided")} label={t("satFacturas.field.complementoXml")} t={t} value={factura.complementoXmlUrl} />
          </DetailSection>

          <DetailSection title={t("satFacturas.section.amounts")}>
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.serviceDescription")} value={factura.serviceDescription} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.pax")} value={factura.pax} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.unitValue")} value={formatSatMxn(factura.unitValueMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.exchangeRate")} value={factura.exchangeRateToMxn} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.subtotal")} value={formatSatMxn(factura.subtotalMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.iva")} value={formatSatMxn(factura.ivaMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.ivaRetention")} value={formatSatMxn(factura.ivaRetentionMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.isrRetention")} value={formatSatMxn(factura.isrRetentionMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.tax")} value={formatSatMxn(factura.taxTotalMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.commission")} value={formatSatMxn(factura.commissionMxn)} />
            <Field fallback={t("common.notProvided")} label={t("satFacturas.field.total")} value={formatSatMxn(factura.totalMxn)} />
          </DetailSection>
        </section>
        {accountantRequest ? (
          <DetailSection
            action={<SatCopyButton t={t} value={accountantRequest} />}
            title={t("satFacturas.field.accountantRequest")}
          >
            <pre className="whitespace-pre-wrap text-sm font-semibold leading-6 text-zinc-100 md:col-span-2">
              {accountantRequest}
            </pre>
          </DetailSection>
        ) : null}
      </div>
    </main>
  );
}

function DetailSection(props: { action?: ReactNode; children: ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <h2 className="text-xl font-bold">{props.title}</h2>
        {props.action}
      </div>
      <div className="grid gap-5 p-5 md:grid-cols-2">{props.children}</div>
    </section>
  );
}

function Field(props: { fallback: string; label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{props.label}</p>
      <p className="mt-2 font-semibold text-zinc-100">{props.value || props.fallback}</p>
    </div>
  );
}

function FileField(props: {
  fallback: string;
  label: string;
  t: (key: TranslationKey) => string;
  value: string | null;
}) {
  if (!props.value) {
    return <Field fallback={props.fallback} label={props.label} value={props.value} />;
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{props.label}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-700 px-3 text-xs font-bold text-zinc-100 transition hover:border-cyan-300/60 hover:text-cyan-200"
          href={props.value}
          rel="noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" size={14} />
          {props.t("satFacturas.action.open")}
        </a>
        <SatCopyButton t={props.t} value={props.value} />
      </div>
    </div>
  );
}

function LinkButton(props: { href: string; icon: typeof ExternalLink; label: string }) {
  const Icon = props.icon;
  return (
    <Link className="inline-flex h-11 items-center gap-2 rounded-md border border-cyan-300/40 px-4 text-sm font-bold text-cyan-200 hover:border-cyan-200" href={props.href}>
      <Icon aria-hidden="true" size={17} />
      {props.label}
    </Link>
  );
}

function Shell(props: { children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{props.children}</main>;
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(value));
}
