"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react";

import { useEventQuotes } from "../../quote/hooks/use-event-quotes";
import { QuoteManager } from "../../quote/components/quote-manager";
import { statusKeys as quoteStatusKeys } from "../../quote/components/quote-status-keys";
import { buildDocumentNumber } from "../../shared/documents/document-identifiers";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import { buildLineItemsTooltip, LineItemsHoverIcon } from "./client-line-items-hover";
import { ClientRowActionsMenu } from "./client-row-actions-menu";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

export function ClientQuotesTab({ client, locale, t }: ClientDetailSectionProps) {
  const event = client.event;

  if (!event) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.quotes")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  const [showBuilder, setShowBuilder] = useState(false);
  const quoteState = useEventQuotes(event.id);

  useEffect(() => {
    if (!showBuilder) void quoteState.refresh();
  }, [quoteState.refresh, showBuilder]);

  return (
    <ClientDetailSection title={t("crm.quote.title")}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950"
            onClick={() => setShowBuilder(true)}
            type="button"
          >
            {t("crm.client.detail.action.newQuote")}
          </button>
          {showBuilder ? (
            <button
              className="inline-flex h-10 items-center rounded-md border border-zinc-700 px-4 text-sm font-bold text-zinc-200"
              onClick={() => setShowBuilder(false)}
              type="button"
            >
              {t("crm.client.planner.action.cancel")}
            </button>
          ) : null}
        </div>

        {quoteState.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.quote.loading")}</p>
        ) : null}
        {quoteState.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.quote.loadError")}</p>
        ) : null}
        {!quoteState.isLoading && quoteState.quotes.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.quote.empty.quotes")}
          </p>
        ) : null}

        {quoteState.quotes.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-900/80">
                <tr>
                  <Head>{t("crm.client.detail.field.quoteId")}</Head>
                  <Head>{t("crm.client.detail.field.quoteName")}</Head>
                  <Head>{t("crm.client.detail.field.sentDate")}</Head>
                  <Head>{t("public.portal.columns.expiryDate")}</Head>
                  <Head alignRight>{t("crm.client.detail.field.totalAmount")}</Head>
                  <Head>{t("crm.client.detail.field.version")}</Head>
                  <Head>{t("crm.client.detail.field.status")}</Head>
                  <Head alignRight>{t("public.portal.columns.actions")}</Head>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                {quoteState.quotes.map((quote) => {
                  const version = quote.currentVersion;
                  const lineItemsTooltip = buildLineItemsTooltip(version?.items ?? [], t);
                  return (
                    <tr key={quote.id}>
                      <Cell className="font-bold text-cyan-200">{buildDocumentNumber("quote", quote.id)}</Cell>
                      <Cell>
                        <div className="inline-flex items-center gap-2">
                          <span>{quote.title}</span>
                          <LineItemsHoverIcon
                            ariaLabel={`${t("crm.client.detail.action.view")} ${t("crm.client.detail.field.quoteName")}`}
                            heading={`${t("crm.client.detail.field.quoteName")} ${t("crm.client.detail.field.version")}`}
                            tooltip={lineItemsTooltip}
                          />
                        </div>
                      </Cell>
                      <Cell>{formatDate(version?.sentAt, locale)}</Cell>
                      <Cell>{formatDate(version?.expiresAt ?? null, locale)}</Cell>
                      <Cell alignRight className="font-bold text-white">
                        {formatMoneyMxn(version?.totalMxn ?? "0")}
                      </Cell>
                      <Cell>v{version?.versionNumber ?? 1}</Cell>
                      <Cell>
                        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                          {t(quoteStatusKeys[quote.status])}
                        </span>
                      </Cell>
                      <Cell alignRight>
                        <ClientRowActionsMenu
                          actions={[
                            {
                              href: `/quote-print/${event.id}/${quote.id}`,
                              label: t("crm.client.detail.action.view"),
                            },
                            {
                              href: `/api/crm/events/${event.id}/quotes/${quote.id}/pdf`,
                              label: t("crm.client.detail.action.download"),
                            },
                          ]}
                          label={t("public.portal.columns.actions")}
                        />
                      </Cell>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {showBuilder ? (
          <QuoteManager
            bookingType={event.bookingType}
            eventContacts={event.contacts}
            eventDistanceFromHqKm={event.venueDistanceFromHqKm}
            eventId={event.id}
            eventType={event.eventType}
            t={t}
          />
        ) : null}
      </div>
    </ClientDetailSection>
  );
}

function Head(props: { alignRight?: boolean; children: string }) {
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

function formatDate(value: string | null | undefined, locale: "en" | "es") {
  if (!value) return "-";
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", { dateStyle: "medium" }).format(date);
}
