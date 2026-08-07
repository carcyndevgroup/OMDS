"use client";

import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

import type { Locale, TranslationKey } from "@/core/i18n";
import { useTranslation } from "@/core/i18n";
import { formatMoneyMxn } from "@/features/crm/shared/utils/money-format";

import { useSatPayment } from "../hooks/use-sat-payment";
import type {
  SatComplementoAction,
  SatFacturaStatus,
  SatPaymentAllocationItem,
} from "../types/sat-factura";

type SatPaymentDetailProps = {
  paymentId: string;
};

const statusKeys: Record<SatFacturaStatus, TranslationKey> = {
  accountant_requested: "satFacturas.status.accountant_requested",
  cancelled: "satFacturas.status.cancelled",
  issued: "satFacturas.status.issued",
  paid: "satFacturas.status.paid",
  partially_paid: "satFacturas.status.partially_paid",
  pending: "satFacturas.status.pending",
  sent_to_venue: "satFacturas.status.sent_to_venue",
};

const complementoKeys: Record<string, TranslationKey> = {
  not_required: "satFacturas.complemento.notRequired",
  pending: "satFacturas.complemento.pending",
  received: "satFacturas.complemento.received",
  requested: "satFacturas.complemento.requested",
  sent: "satFacturas.complemento.sent",
};

export function SatPaymentDetail({ paymentId }: SatPaymentDetailProps) {
  const { locale, t } = useTranslation();
  const state = useSatPayment(paymentId);
  const [actionStatus, setActionStatus] = useState<"idle" | "success" | "error">("idle");
  const [busyFacturaId, setBusyFacturaId] = useState("");

  if (state.isLoading) return <Shell>{t("satFacturas.loading")}</Shell>;
  if (state.hasError || !state.payment) return <Shell>{t("satFacturas.loadError")}</Shell>;

  const payment = state.payment;

  const updateComplemento = async (
    facturaId: string,
    action: SatComplementoAction,
  ) => {
    setBusyFacturaId(facturaId);
    setActionStatus("idle");
    try {
      const response = await fetch(`/api/sat-facturas/${facturaId}/complemento`, {
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      if (!response.ok) throw new Error("complemento_update_failed");
      setActionStatus("success");
      state.refresh();
    } catch {
      setActionStatus("error");
    } finally {
      setBusyFacturaId("");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header>
          <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-cyan-200" href="/sat-facturas/payments">
            <ArrowLeft aria-hidden="true" size={18} />
            {t("satPayments.action.back")}
          </Link>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("satPayments.detail.title")}</h1>
          <p className="mt-2 text-base font-bold text-cyan-200">{formatMoneyMxn(payment.amountMxn)}</p>
        </header>

        <DetailSection title={t("satPayments.section.details")}>
          <Field label={t("satPayments.field.paymentDate")} value={formatDate(payment.paymentDate, locale)} />
          <Field label={t("satPayments.field.reference")} value={payment.reference} />
          <Field label={t("satPayments.field.venue")} value={payment.venueName} />
          <Field label={t("satPayments.field.bankAccount")} value={payment.bankAccountName} />
          <Field label={t("satPayments.field.proof")} value={payment.proofFileUrl} />
          <Field label={t("satFacturas.field.notes")} value={payment.notes} />
        </DetailSection>

        <DetailSection title={t("satPayments.section.allocations")}>
          <p aria-live="polite" className="md:col-span-2 text-sm font-bold">
            {actionStatus === "success" ? <span className="text-emerald-300">{t("satPayments.quickAction.success")}</span> : null}
            {actionStatus === "error" ? <span className="text-rose-300">{t("satPayments.quickAction.error")}</span> : null}
          </p>
          <div className="space-y-3 md:col-span-2">
            {payment.allocations.map((allocation) => (
              <AllocationRow
                allocation={allocation}
                isBusy={busyFacturaId === allocation.facturaId}
                key={allocation.facturaId}
                onAction={updateComplemento}
              />
            ))}
          </div>
        </DetailSection>
      </div>
    </main>
  );
}

function AllocationRow({
  allocation,
  isBusy,
  onAction,
}: {
  allocation: SatPaymentAllocationItem;
  isBusy: boolean;
  onAction: (facturaId: string, action: SatComplementoAction) => Promise<void>;
}) {
  const { t } = useTranslation();
  const complementoKey = complementoKeys[allocation.complementoStatus]
    ?? "satFacturas.complemento.pending";

  return (
    <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-black text-cyan-200">{allocation.clientName || t("common.notProvided")}</h3>
          <span className="rounded bg-cyan-300/15 px-2 py-1 text-xs font-bold text-cyan-200">
            {t(statusKeys[allocation.status])}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-bold text-zinc-500">{allocation.venueName || t("common.notProvided")}</p>
        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <FileText aria-hidden="true" size={15} />
          {allocation.facturaNumber || t("common.notProvided")}
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-cyan-200">
          {t("satFacturas.field.complemento")}: {t(complementoKey)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 md:justify-end">
        <div className="text-left md:text-right">
          <p className="text-sm font-black text-zinc-100">{formatMoneyMxn(allocation.amountAppliedMxn)}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{formatMoneyMxn(allocation.totalMxn)}</p>
        </div>
        <QuickAction action="requested" disabled={isBusy} label={t("satPayments.action.markRequested")} onAction={onAction} facturaId={allocation.facturaId} />
        <QuickAction action="received" disabled={isBusy} label={t("satPayments.action.markReceived")} onAction={onAction} facturaId={allocation.facturaId} />
        <QuickAction action="sent" disabled={isBusy} label={t("satPayments.action.markSent")} onAction={onAction} facturaId={allocation.facturaId} />
        <Link className="rounded-md border border-cyan-300/30 p-2 text-cyan-200 hover:border-cyan-200" href={`/sat-facturas/${allocation.facturaId}`}>
          <ExternalLink aria-hidden="true" size={17} />
        </Link>
      </div>
    </div>
  );
}

function QuickAction({
  action,
  disabled,
  facturaId,
  label,
  onAction,
}: {
  action: SatComplementoAction;
  disabled: boolean;
  facturaId: string;
  label: string;
  onAction: (facturaId: string, action: SatComplementoAction) => Promise<void>;
}) {
  return (
    <button
      className="h-9 rounded-md border border-zinc-700 px-3 text-xs font-bold text-zinc-200 hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-wait disabled:opacity-60"
      disabled={disabled}
      onClick={() => void onAction(facturaId, action)}
      type="button"
    >
      {label}
    </button>
  );
}

function DetailSection(props: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-900 shadow-xl shadow-black/20">
      <h2 className="border-b border-zinc-800 px-5 py-4 text-xl font-bold">{props.title}</h2>
      <div className="grid gap-5 p-5 md:grid-cols-2">{props.children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 break-words font-semibold text-zinc-100">{value || t("common.notProvided")}</p>
    </div>
  );
}

function Shell(props: { children: ReactNode }) {
  return <main className="min-h-screen bg-zinc-950 p-8 text-center text-sm text-zinc-500">{props.children}</main>;
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
