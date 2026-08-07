"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n";
import { formatPortalDate, getDocumentNumber } from "../utils/portal-document-presentation";

import type { PublicPortalInvoice } from "../repositories/public-portal-documents-repository";
import { PublicDocumentRowActions } from "./public-document-row-actions";

type PublicInvoiceSectionProps = {
  accessKey: string;
  invoices: PublicPortalInvoice[];
};

export function PublicInvoiceSection(props: PublicInvoiceSectionProps) {
  const { accessKey, invoices } = props;
  const { t } = useTranslation();

  if (!invoices.length) {
    return <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{t("public.portal.noInvoices")}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            <HeaderCell>{t("public.portal.columns.id")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.dateIssued")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.dueDate")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.amount")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.status")}</HeaderCell>
            <HeaderCell alignRight>{t("public.portal.columns.actions")}</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
          {invoices.map((invoice) => (
            <tr key={invoice.invoiceId}>
              <Cell className="font-bold text-cyan-200">{getDocumentNumber("invoice", invoice.invoiceId)}</Cell>
              <Cell>{formatPortalDate(invoice.issuedAt, "en")}</Cell>
              <Cell>{formatPortalDate(invoice.dueAt, "en")}</Cell>
              <Cell className="font-bold text-white">{invoice.totalMxn}</Cell>
              <Cell>
                <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                  {t(`crm.invoice.status.${invoice.status}` as never)}
                </span>
              </Cell>
              <Cell alignRight>
                <PublicDocumentRowActions
                  canDownload={invoice.hasBeenViewed}
                  downloadHref={`/api/portal/${accessKey}/documents/invoice/${invoice.invoiceId}/pdf`}
                  downloadLabel={t("public.portal.action.download")}
                  viewHref={`/portal/${accessKey}/documents/invoice/${invoice.invoiceId}`}
                  viewLabel={t("public.portal.action.view")}
                />
              </Cell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell(props: { alignRight?: boolean; children: string }) {
  return (
    <th
      className={[
        "px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500",
        props.alignRight ? "text-right" : "",
      ].join(" ")}
      scope="col"
    >
      {props.children}
    </th>
  );
}

function Cell(props: { alignRight?: boolean; children: ReactNode; className?: string }) {
  return (
    <td
      className={[
        "px-3 py-3 text-zinc-200",
        props.alignRight ? "text-right" : "",
        props.className ?? "",
      ].join(" ")}
    >
      {props.children}
    </td>
  );
}
