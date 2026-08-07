"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { useEventMessageDrafts } from "../../messages/hooks/use-event-message-drafts";
import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import { useInvoiceMutation } from "../../invoice/hooks/use-invoice-mutation";
import { useInvoices } from "../../invoice/hooks/use-invoices";
import type { InvoiceAction, InvoiceCreateInput } from "../../invoice/types/invoice";
import { buildDocumentNumber } from "../../shared/documents/document-identifiers";
import { formatMoneyMxn } from "../../shared/utils/money-format";
import { ClientInvoiceCreateModal } from "./client-invoice-create-modal";
import { buildLineItemsTooltip, LineItemsHoverIcon } from "./client-line-items-hover";
import { ReminderHistoryPopover } from "./client-reminder-history-popover";
import {
  buildReminderMessageInput,
  getReminderHistoryByDocumentId,
  getReminderSentAtByDocumentId,
} from "./client-reminder-messages";
import { ClientRowActionsMenu } from "./client-row-actions-menu";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const statusKeys = {
  draft: "crm.invoice.status.draft",
  issued: "crm.invoice.status.issued",
  paid: "crm.invoice.status.paid",
  payment_promised: "crm.invoice.status.paymentPromised",
  void: "crm.invoice.status.void",
} as const;

export function ClientInvoicesTab(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const event = client.event;
  const eventId = event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.invoices")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  return <InvoiceList contacts={event.contacts} eventId={eventId} locale={locale} t={t} />;
}

function InvoiceList(props: Pick<ClientDetailSectionProps, "locale" | "t"> & {
  contacts: NonNullable<ClientDetailSectionProps["client"]["event"]>["contacts"];
  eventId: string;
}) {
  const { contacts, eventId, locale, t } = props;
  const [reminderPendingId, setReminderPendingId] = useState<string | null>(null);
  const [reminderErrorId, setReminderErrorId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const reminderDraftState = useEventMessageDrafts(eventId);
  const messageMutation = useMessageDraftMutation(eventId);
  const state = useInvoices(eventId);
  const mutation = useInvoiceMutation(eventId);
  const reminderSentAtById = useMemo(
    () => getReminderSentAtByDocumentId(reminderDraftState.drafts, "invoice"),
    [reminderDraftState.drafts],
  );
  const reminderHistoryById = useMemo(
    () => getReminderHistoryByDocumentId(reminderDraftState.drafts, "invoice"),
    [reminderDraftState.drafts],
  );

  const create = async (input: InvoiceCreateInput) => {
    await mutation.create(input);
    setShowCreate(false);
    await state.refresh();
  };

  const workflow = async (invoiceId: string, action: InvoiceAction) => {
    await mutation.workflow(invoiceId, action);
    await state.refresh();
  };

  const sendReminder = async (invoiceId: string) => {
    if (messageMutation.status === "loading") return;

    const input = buildReminderMessageInput({
      contacts,
      documentId: invoiceId,
      documentKind: "invoice",
      t,
    });

    if (!input) {
      setReminderErrorId(invoiceId);
      return;
    }

    setReminderErrorId(null);
    setReminderPendingId(invoiceId);
    try {
      await messageMutation.create(input);
      await reminderDraftState.refresh();
    } catch {
      setReminderErrorId(invoiceId);
    } finally {
      setReminderPendingId(null);
    }
  };

  return (
    <ClientDetailSection title={t("crm.invoice.title")}>
      <div className="space-y-5">
        <button
          className="inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-black text-zinc-950"
          onClick={() => setShowCreate(true)}
          type="button"
        >
          {t("crm.client.detail.action.addInvoice")}
        </button>
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.invoice.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.invoice.loadError")}</p>
        ) : null}
        {!state.isLoading && state.invoices.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.invoice.empty")}
          </p>
        ) : null}
        {state.invoices.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-900/80">
                <tr>
                  <Head>{t("crm.client.detail.field.invoiceId")}</Head>
                  <Head>{t("crm.client.detail.field.invoiceAmount")}</Head>
                  <Head>{t("crm.client.detail.field.dueDate")}</Head>
                  <Head>{t("crm.client.detail.field.balanceDue")}</Head>
                  <Head>{t("crm.client.detail.field.status")}</Head>
                  <Head alignRight>{t("public.portal.columns.actions")}</Head>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                {state.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <Cell className="font-bold text-cyan-200">{buildDocumentNumber("invoice", invoice.id)}</Cell>
                    <Cell className="font-bold text-white">
                      <div className="inline-flex items-center gap-2">
                        <span>{formatMoneyMxn(invoice.totalMxn)}</span>
                        <LineItemsHoverIcon
                          ariaLabel={`${t("crm.client.detail.action.view")} ${t("crm.client.detail.field.invoiceAmount")}`}
                          heading={`${t("crm.client.detail.field.invoiceId")} ${t("crm.client.detail.field.invoiceAmount")}`}
                          tooltip={buildLineItemsTooltip(invoice.items, t)}
                        />
                      </div>
                    </Cell>
                    <Cell>{formatDate(invoice.dueAt, locale)}</Cell>
                    <Cell>{formatMoneyMxn(invoice.status === "paid" ? "0" : invoice.totalMxn)}</Cell>
                    <Cell>
                      <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                        {t(statusKeys[invoice.status])}
                      </span>
                    </Cell>
                    <Cell alignRight>
                      <div className="flex flex-col items-end gap-1">
                        <ClientRowActionsMenu
                          actions={[
                            {
                              href: `/invoice-print/${eventId}/${invoice.id}`,
                              label: t("crm.client.detail.action.view"),
                            },
                            {
                              href: `/api/crm/events/${eventId}/invoices/${invoice.id}/pdf`,
                              label: t("crm.client.detail.action.download"),
                            },
                            {
                              disabled:
                                invoice.status === "paid"
                                || invoice.status === "void"
                                || messageMutation.status === "loading",
                              label:
                                reminderPendingId === invoice.id
                                  ? t("crm.client.detail.action.sending")
                                  : t("crm.client.detail.action.sendReminder"),
                              onClick: () => {
                                void sendReminder(invoice.id);
                              },
                            },
                            {
                              disabled: invoice.status === "paid" || invoice.status === "void",
                              label: t("crm.client.detail.action.recordPayment"),
                              onClick: () => void workflow(invoice.id, "pay"),
                            },
                          ]}
                          label={t("public.portal.columns.actions")}
                        />
                        {reminderSentAtById[invoice.id] ? (
                          <div className="flex items-center gap-1">
                            <p className="text-right text-xs text-cyan-200">
                              {t("crm.client.detail.reminder.sentAt")} {formatDateTime(reminderSentAtById[invoice.id], locale)}
                            </p>
                            <ReminderHistoryPopover
                              ariaLabel={`${t("crm.client.detail.action.sendReminder")} ${t("crm.client.detail.reminder.sentAt")}`}
                              heading={`${t("crm.client.detail.action.sendReminder")} ${t("crm.client.detail.field.invoiceId")}`}
                              history={reminderHistoryById[invoice.id] ?? []}
                              locale={locale}
                            />
                          </div>
                        ) : null}
                        {reminderErrorId === invoice.id ? (
                          <p className="text-right text-xs text-rose-300">
                            {t("crm.client.detail.reminder.failed")}
                          </p>
                        ) : null}
                      </div>
                    </Cell>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        ) : null}

      </div>
      {showCreate ? (
        <ClientInvoiceCreateModal
          isSaving={mutation.status === "loading"}
          onClose={() => setShowCreate(false)}
          onCreate={create}
          t={t}
        />
      ) : null}
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

function formatDate(value: string | null, locale: "en" | "es") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value: string, locale: "en" | "es") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
