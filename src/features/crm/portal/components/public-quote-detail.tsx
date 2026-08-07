"use client";

import { useTranslation, type TranslationKey } from "@/core/i18n";

import { formatQuoteMoney } from "../../quote/utils/quote-money";
import type { PublicPortalQuote } from "../types/client-portal";
import { PublicQuoteActions } from "./public-quote-actions";

type PublicQuoteDetailProps = {
  accessKey: string;
  quote: PublicPortalQuote;
  showDownloadAction?: boolean;
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

export function PublicQuoteDetail(props: PublicQuoteDetailProps) {
  const { accessKey, quote, showDownloadAction = true } = props;
  const { t } = useTranslation();
  const displayStatus = quote.isExpired ? "expired" : quote.status;
  const canRespond =
    !quote.isExpired && (quote.status === "sent" || quote.status === "viewed");
  const canDownload = quote.status === "accepted" && quote.hasBeenViewed;

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-900/70 p-5" id={`quote-${quote.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-cyan-200">{quote.title}</h3>
          <p className="mt-2 text-sm text-zinc-500">
            {t("crm.quote.version")} {quote.versionNumber} · {t(getStatusKey(displayStatus))}
          </p>
          {quote.isExpired ? (
            <p className="mt-2 text-sm font-bold text-rose-200">
              {t("public.portal.quote.expired")}
            </p>
          ) : null}
        </div>
        <div className="space-y-3 text-right">
          <p className="text-xs font-bold uppercase text-zinc-500">{t("crm.quote.total.total")}</p>
          <p className="text-2xl font-black text-white">{formatQuoteMoney(quote.totalMxn, quote)}</p>
          {showDownloadAction ? (
            canDownload ? (
              <a
                className="inline-flex items-center rounded-md bg-cyan-300 px-3 py-2 text-xs font-black text-zinc-950"
                href={`/api/portal/${accessKey}/documents/quote/${quote.id}/pdf`}
              >
                {t("public.portal.action.download")}
              </a>
            ) : (
              <p className="text-xs font-bold text-zinc-500">{t("public.portal.download.locked")}</p>
            )
          ) : null}
        </div>
      </div>

      <div className="mt-5 divide-y divide-zinc-800 border-t border-zinc-800">
        {quote.items.map((item) => (
          <div className="grid gap-2 py-4 md:grid-cols-[1fr_auto]" key={`${quote.id}-${item.sortOrder}`}>
            <div>
              <p className="font-bold text-zinc-100">{item.description}</p>
              {item.details ? <p className="mt-1 text-sm leading-6 text-zinc-500">{item.details}</p> : null}
              <p className="mt-2 text-sm text-zinc-500">
                {t("crm.quote.field.quantity")} {item.quantity}
              </p>
            </div>
            <p className="font-bold text-zinc-100">{formatQuoteMoney(item.lineTotalMxn, quote)}</p>
          </div>
        ))}
      </div>
      <QuoteTotals quote={quote} />
      {canRespond ? (
        <PublicQuoteActions
          acceptLabel={t("public.portal.quote.accept")}
          accessKey={accessKey}
          declineLabel={t("public.portal.quote.decline")}
          quoteId={quote.id}
          respondingLabel={t("public.portal.quote.responding")}
        />
      ) : null}
    </article>
  );
}

function QuoteTotals(props: { quote: PublicPortalQuote }) {
  const { quote } = props;
  const { t } = useTranslation();

  return (
    <dl className="mt-5 space-y-2 border-t border-zinc-800 pt-4 text-sm">
      <TotalRow label={t("crm.quote.total.subtotal")} quote={quote} value={quote.subtotalMxn} />
      {quote.appliesIvaTax ? <TotalRow label={t("crm.quote.total.ivaTax")} quote={quote} value={quote.ivaTaxMxn} /> : null}
      {quote.appliesIvaRetention ? (
        <TotalRow isNegative label={t("crm.quote.total.ivaRetention")} quote={quote} value={quote.ivaRetentionMxn} />
      ) : null}
      {quote.appliesIsrRetention ? (
        <TotalRow isNegative label={t("crm.quote.total.isrRetention")} quote={quote} value={quote.isrRetentionMxn} />
      ) : null}
      <TotalRow label={t("crm.quote.total.total")} quote={quote} value={quote.totalMxn} />
    </dl>
  );
}

function TotalRow(props: { isNegative?: boolean; label: string; quote: PublicPortalQuote; value: string }) {
  const { isNegative = false, label, quote, value } = props;

  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-bold text-zinc-100">
        {isNegative ? "-" : ""}
        {formatQuoteMoney(value, quote)}
      </dd>
    </div>
  );
}
