"use client";

import { ArrowLeft, Download, Printer } from "lucide-react";
import Link from "next/link";

import { useTranslation } from "@/core/i18n";

import { useInvoices } from "../hooks/use-invoices";

type InvoicePrintPageProps = {
  eventId: string;
  invoiceId: string;
};

export function InvoicePrintPage(props: InvoicePrintPageProps) {
  const { eventId, invoiceId } = props;
  const { t } = useTranslation();
  const state = useInvoices(eventId);
  const invoice = state.invoices.find((item) => item.id === invoiceId);

  if (state.isLoading) return <StatusMessage message={t("crm.invoice.loading")} />;
  if (state.hasError || !invoice) return <StatusMessage isError message={t("crm.invoice.loadError")} />;

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950 print:bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-6 py-4 print:hidden">
        <Link
          className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
          href={`/crm/events/${eventId}`}
        >
          <ArrowLeft aria-hidden="true" size={16} />
          {t("crm.invoice.print.back")}
        </Link>
        <div className="flex items-center gap-2">
          <a
            className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-800 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
            href={`/api/crm/events/${eventId}/invoices/${invoiceId}/pdf`}
          >
            <Download aria-hidden="true" size={16} />
            {t("crm.invoice.print.download")}
          </a>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-black text-zinc-950 shadow-sm transition hover:bg-cyan-200"
            onClick={() => window.print()}
            type="button"
          >
            <Printer aria-hidden="true" size={16} />
            {t("crm.invoice.print.open")}
          </button>
        </div>
      </div>
      <iframe
        className="h-[calc(100vh-5rem)] min-h-[48rem] w-full border-0"
        src={`/api/crm/events/${eventId}/invoices/${invoiceId}/pdf?inline=1`}
        title={t("crm.invoice.title")}
      />
    </main>
  );
}

function StatusMessage(props: { isError?: boolean; message: string }) {
  const color = props.isError ? "text-rose-600" : "text-zinc-500";

  return (
    <main className={`min-h-screen bg-white px-4 py-12 text-center text-sm font-semibold ${color}`}>
      {props.message}
    </main>
  );
}
