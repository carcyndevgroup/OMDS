"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import type { PublicPortalInvoice } from "../repositories/public-portal-documents-repository";

type PublicInvoiceDetailProps = {
  accessKey: string;
  invoice: PublicPortalInvoice;
  showDownloadAction?: boolean;
};

export function PublicInvoiceDetail(props: PublicInvoiceDetailProps) {
  const { accessKey, invoice, showDownloadAction = true } = props;
  const { t } = useTranslation();
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);

  const pay = async () => {
    setIsPaying(true);
    const response = await fetch(`/api/portal/${accessKey}/invoices/${invoice.invoiceId}`, { method: "PATCH" });
    setIsPaying(false);
    if (!response.ok) {
      router.refresh();
      return;
    }
    router.refresh();
  };

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-cyan-200">{getInvoiceTitle(t, invoice)}</h3>
          <p className="mt-2 text-sm text-zinc-500">{t(`crm.invoice.status.${invoice.status}` as never)}</p>
        </div>
        <div className="flex items-center gap-3">
          {showDownloadAction ? (
            invoice.hasBeenViewed ? (
              <a
                className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-100"
                href={`/api/portal/${accessKey}/documents/invoice/${invoice.invoiceId}/pdf`}
              >
                {t("public.portal.action.download")}
              </a>
            ) : (
              <p className="text-xs font-bold text-zinc-500">{t("public.portal.download.locked")}</p>
            )
          ) : null}
          {invoice.clientVisible && (invoice.status === "issued" || invoice.status === "payment_promised") ? (
            <button
              className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950 disabled:opacity-60"
              disabled={isPaying}
              onClick={() => void pay()}
              type="button"
            >
              {isPaying ? t("public.portal.invoice.paying") : t("public.portal.invoice.pay")}
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 text-sm text-zinc-200 md:grid-cols-3">
        <Stat label={t("public.portal.invoice.total")} value={invoice.totalMxn} />
        <Stat label={t("public.portal.invoice.subtotal")} value={invoice.subtotalMxn} />
        <Stat label={t("public.portal.invoice.tax")} value={invoice.taxTotalMxn} />
      </div>
      <div className="mt-5 space-y-3 border-t border-zinc-800 pt-5">
        {invoice.items.map((item) => (
          <div className="flex items-start justify-between gap-4 text-sm" key={`${invoice.invoiceId}-${item.sortOrder}`}>
            <div>
              <p className="font-bold text-zinc-100">{item.description}</p>
              {item.details ? <p className="mt-1 text-zinc-500">{item.details}</p> : null}
            </div>
            <p className="font-bold text-zinc-100">{item.lineTotalMxn}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{props.label}</p>
      <p className="mt-1 text-lg font-black text-white">{props.value}</p>
    </div>
  );
}

function getInvoiceTitle(
  t: ReturnType<typeof useTranslation>["t"],
  invoice: PublicPortalInvoice,
) {
  if (invoice.installmentKey === "retainer") return t("public.portal.invoice.retainerTitle");
  if (invoice.installmentKey === "balance") return t("public.portal.invoice.balanceTitle");
  return t(invoice.invoiceType === "pv_internal_factura" ? "public.portal.invoice.pvTitle" : "public.portal.invoice.title");
}
