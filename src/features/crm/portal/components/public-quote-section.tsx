import { useTranslation, type TranslationKey } from "@/core/i18n";
import type { ReactNode } from "react";
import { getDocumentNumber, formatPortalDate } from "../utils/portal-document-presentation";

import { formatQuoteMoney } from "../../quote/utils/quote-money";
import type { PublicPortalQuote } from "../types/client-portal";
import { PublicDocumentRowActions } from "./public-document-row-actions";

type PublicQuoteSectionProps = {
  accessKey: string;
  quotes: PublicPortalQuote[];
};

const statusKeys = {
  accepted: "crm.quote.status.accepted",
  expired: "crm.quote.status.expired",
  sent: "crm.quote.status.sent",
  viewed: "crm.quote.status.viewed",
} satisfies Record<string, TranslationKey>;

const getStatusKey = (status: string): TranslationKey => {
  return status in statusKeys
    ? statusKeys[status as keyof typeof statusKeys]
    : "crm.quote.status.sent";
};

export function PublicQuoteSection({ accessKey, quotes }: PublicQuoteSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-black text-white">{t("crm.quote.title")}</h2>
      {quotes.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          {t("public.portal.noQuotes")}
        </p>
      ) : null}
      {quotes.length ? (
        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-900/80">
              <tr>
                <HeaderCell>{t("public.portal.columns.id")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.name")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.dateIssued")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.expiryDate")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.version")}</HeaderCell>
                <HeaderCell>{t("public.portal.columns.status")}</HeaderCell>
                <HeaderCell alignRight>{t("public.portal.columns.amount")}</HeaderCell>
                <HeaderCell alignRight>{t("public.portal.columns.actions")}</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
              {quotes.map((quote) => (
                <tr key={quote.id}>
                  <Cell className="font-bold text-cyan-200">{getDocumentNumber("quote", quote.id)}</Cell>
                  <Cell>{quote.title}</Cell>
                  <Cell>{formatPortalDate(quote.issuedAt, "en")}</Cell>
                  <Cell>{formatPortalDate(quote.expiresAt, "en")}</Cell>
                  <Cell>v{quote.versionNumber}</Cell>
                  <Cell>
                    <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                      {t(getStatusKey(quote.isExpired ? "expired" : quote.status))}
                    </span>
                  </Cell>
                  <Cell alignRight className="font-bold text-white">{formatQuoteMoney(quote.totalMxn, quote)}</Cell>
                  <Cell alignRight>
                    <PublicDocumentRowActions
                      canDownload={quote.status === "accepted" && quote.hasBeenViewed}
                      downloadHref={`/api/portal/${accessKey}/documents/quote/${quote.id}/pdf`}
                      downloadLabel={t("public.portal.action.download")}
                      viewHref={`/portal/${accessKey}/documents/quote/${quote.id}`}
                      viewLabel={t("public.portal.action.view")}
                    />
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
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
