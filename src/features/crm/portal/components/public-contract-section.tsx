"use client";

import type { ReactNode } from "react";

import { useTranslation } from "@/core/i18n";
import { formatPortalDate, getDocumentNumber } from "../utils/portal-document-presentation";

import type { PublicPortalContract } from "../repositories/public-portal-documents-repository";
import { PublicDocumentRowActions } from "./public-document-row-actions";

type PublicContractSectionProps = {
  accessKey: string;
  contracts: PublicPortalContract[];
};

export function PublicContractSection(props: PublicContractSectionProps) {
  const { accessKey, contracts } = props;
  const { t } = useTranslation();

  if (!contracts.length) {
    return <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">{t("public.portal.noContracts")}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            <HeaderCell>{t("public.portal.columns.id")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.name")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.dateIssued")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.version")}</HeaderCell>
            <HeaderCell>{t("public.portal.columns.status")}</HeaderCell>
            <HeaderCell alignRight>{t("public.portal.columns.actions")}</HeaderCell>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
          {contracts.map((contract) => (
            <tr key={contract.contractId}>
              <Cell className="font-bold text-cyan-200">{getDocumentNumber("contract", contract.contractId)}</Cell>
              <Cell>{contract.title}</Cell>
              <Cell>{formatPortalDate(contract.issuedAt, "en")}</Cell>
              <Cell>v{contract.versionNumber}</Cell>
              <Cell>
                <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                  {t(contract.status === "signed" ? "crm.contract.status.signed" : "crm.contract.status.sent")}
                </span>
              </Cell>
              <Cell alignRight>
                <PublicDocumentRowActions
                  canDownload={contract.hasBeenViewed}
                  downloadHref={`/api/portal/${accessKey}/documents/contract/${contract.contractId}/pdf`}
                  downloadLabel={t("public.portal.action.download")}
                  viewHref={`/portal/${accessKey}/documents/contract/${contract.contractId}`}
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
