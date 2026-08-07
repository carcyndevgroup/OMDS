"use client";

import { FileSignature } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { useContractMutation } from "../../contract/hooks/use-contract-mutation";
import { useContracts } from "../../contract/hooks/use-contracts";
import { useEventMessageDrafts } from "../../messages/hooks/use-event-message-drafts";
import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import { buildDocumentNumber } from "../../shared/documents/document-identifiers";
import {
  buildReminderMessageInput,
  getReminderHistoryByDocumentId,
  getReminderSentAtByDocumentId,
} from "./client-reminder-messages";
import { ReminderHistoryPopover } from "./client-reminder-history-popover";
import { ClientRowActionsMenu } from "./client-row-actions-menu";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const statusKeys = {
  draft: "crm.contract.status.draft",
  sent: "crm.contract.status.sent",
  signed: "crm.contract.status.signed",
  void: "crm.contract.status.void",
} as const;

export function ClientContractsTab(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const event = client.event;
  const eventId = event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.contracts")}>
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.event")}
        </p>
      </ClientDetailSection>
    );
  }

  return (
    <ContractList
      clientId={client.id}
      contacts={event.contacts}
      eventId={eventId}
      locale={locale}
      t={t}
    />
  );
}

function ContractList(props: Pick<ClientDetailSectionProps, "locale" | "t"> & {
  clientId: string;
  contacts: NonNullable<ClientDetailSectionProps["client"]["event"]>["contacts"];
  eventId: string;
}) {
  const { clientId, contacts, eventId, locale, t } = props;
  const [reminderPendingId, setReminderPendingId] = useState<string | null>(null);
  const [reminderErrorId, setReminderErrorId] = useState<string | null>(null);
  const reminderDraftState = useEventMessageDrafts(eventId);
  const messageMutation = useMessageDraftMutation(eventId);
  const state = useContracts(eventId);
  const mutation = useContractMutation(eventId);
  const reminderSentAtById = useMemo(
    () => getReminderSentAtByDocumentId(reminderDraftState.drafts, "contract"),
    [reminderDraftState.drafts],
  );
  const reminderHistoryById = useMemo(
    () => getReminderHistoryByDocumentId(reminderDraftState.drafts, "contract"),
    [reminderDraftState.drafts],
  );

  const create = async () => {
    await mutation.create(locale);
    await state.refresh();
  };

  const workflow = async (contractId: string, action: "send" | "sign" | "void") => {
    await mutation.workflow(contractId, action);
    await state.refresh();
  };

  const sendReminder = async (contractId: string) => {
    if (messageMutation.status === "loading") return;

    const input = buildReminderMessageInput({
      contacts,
      documentId: contractId,
      documentKind: "contract",
      t,
    });

    if (!input) {
      setReminderErrorId(contractId);
      return;
    }

    setReminderErrorId(null);
    setReminderPendingId(contractId);
    try {
      await messageMutation.create(input);
      await reminderDraftState.refresh();
    } catch {
      setReminderErrorId(contractId);
    } finally {
      setReminderPendingId(null);
    }
  };

  return (
    <ClientDetailSection title={t("crm.contract.title")}>
      <div className="space-y-5">
        {state.contracts.length === 0 ? (
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950"
            onClick={create}
            type="button"
          >
            <FileSignature aria-hidden="true" size={17} />
            {t("crm.contract.action.create")}
          </button>
        ) : null}
        {state.isLoading ? (
          <p className="text-sm text-zinc-500">{t("crm.contract.loading")}</p>
        ) : null}
        {state.hasError ? (
          <p className="text-sm text-rose-300">{t("crm.contract.loadError")}</p>
        ) : null}
        {!state.isLoading && state.contracts.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.contract.empty")}
          </p>
        ) : null}
        {state.contracts.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
              <thead className="bg-zinc-900/80">
                <tr>
                  <Head>{t("crm.client.detail.field.contractId")}</Head>
                  <Head>{t("crm.client.detail.field.contractName")}</Head>
                  <Head>{t("crm.client.detail.field.dueDate")}</Head>
                  <Head>{t("crm.client.detail.field.status")}</Head>
                  <Head alignRight>{t("public.portal.columns.actions")}</Head>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                {state.contracts.map((contract) => {
                  const title = contract.title;

                  return (
                    <tr key={contract.id}>
                      <Cell className="font-bold text-cyan-200">{buildDocumentNumber("contract", contract.id)}</Cell>
                      <Cell>{title}</Cell>
                      <Cell>{formatDate(contract.sentAt, locale)}</Cell>
                      <Cell>
                        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                          {t(statusKeys[contract.status])}
                        </span>
                      </Cell>
                      <Cell alignRight>
                        <div className="flex flex-col items-end gap-1">
                            <ClientRowActionsMenu
                              actions={[
                                {
                                  href: `/crm/clients/${clientId}/contracts/${contract.id}`,
                                  label: t("crm.client.detail.action.view"),
                                },
                                {
                                  href: `/api/crm/events/${eventId}/contracts/${contract.id}/pdf`,
                                  label: t("crm.client.detail.action.download"),
                                },
                                {
                                  disabled: contract.status !== "sent" || messageMutation.status === "loading",
                                  label:
                                    reminderPendingId === contract.id
                                      ? t("crm.client.detail.action.sending")
                                      : t("crm.client.detail.action.sendReminder"),
                                  onClick: () => {
                                    void sendReminder(contract.id);
                                  },
                                },
                                {
                                  disabled: contract.status !== "sent",
                                  label: t("crm.client.detail.action.counterSign"),
                                  onClick: () => void workflow(contract.id, "sign"),
                                },
                              ]}
                              label={t("public.portal.columns.actions")}
                            />
                          {reminderSentAtById[contract.id] ? (
                            <div className="flex items-center gap-1">
                              <p className="text-right text-xs text-cyan-200">
                                {t("crm.client.detail.reminder.sentAt")} {formatDateTime(reminderSentAtById[contract.id], locale)}
                              </p>
                              <ReminderHistoryPopover
                                ariaLabel={`${t("crm.client.detail.action.sendReminder")} ${t("crm.client.detail.reminder.sentAt")}`}
                                heading={`${t("crm.client.detail.action.sendReminder")} ${t("crm.client.detail.field.contractId")}`}
                                history={reminderHistoryById[contract.id] ?? []}
                                locale={locale}
                              />
                            </div>
                          ) : null}
                          {reminderErrorId === contract.id ? (
                            <p className="text-right text-xs text-rose-300">
                              {t("crm.client.detail.reminder.failed")}
                            </p>
                          ) : null}
                        </div>
                      </Cell>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </div>
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
