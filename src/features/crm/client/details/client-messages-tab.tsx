"use client";

import type { ReactNode } from "react";

import { useEventMessageDrafts } from "../../messages/hooks/use-event-message-drafts";
import { useMessageDraftMutation } from "../../messages/hooks/use-message-draft-mutation";
import type { MessageDraft } from "../../messages/types/message-draft";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const kindKeys = {
  contract: "crm.client.detail.messages.kind.contract",
  general: "crm.client.detail.messages.kind.general",
  invoice: "crm.client.detail.messages.kind.invoice",
  questionnaire: "crm.client.detail.messages.kind.questionnaire",
  quote: "crm.client.detail.messages.kind.quote",
} as const;

const statusKeys = {
  draft: "crm.client.detail.messages.status.draft",
  sent: "crm.client.detail.messages.status.sent",
} as const;

export function ClientMessagesTab(props: ClientDetailSectionProps) {
  const { client, locale, t } = props;
  const eventId = client.event?.id;

  if (!eventId) {
    return (
      <ClientDetailSection title={t("crm.client.detail.tab.messages")}>
        <p className="text-sm text-zinc-500">{t("crm.client.detail.empty.event")}</p>
      </ClientDetailSection>
    );
  }

  return <MessageList eventId={eventId} locale={locale} t={t} />;
}

function MessageList(props: Pick<ClientDetailSectionProps, "locale" | "t"> & {
  eventId: string;
}) {
  const { eventId, locale, t } = props;
  const state = useEventMessageDrafts(eventId);
  const mutation = useMessageDraftMutation(eventId);

  const markSent = async (messageId: string) => {
    await mutation.updateStatus(messageId, "sent");
    await state.refresh();
  };

  return (
    <ClientDetailSection title={t("crm.client.detail.tab.messages")}>
      <div className="space-y-5">
        {state.isLoading ? <p className="text-sm text-zinc-500">{t("crm.client.detail.messages.loading")}</p> : null}
        {state.hasError ? <p className="text-sm text-rose-300">{t("crm.client.detail.messages.loadError")}</p> : null}
        {!state.isLoading && state.drafts.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
            {t("crm.client.detail.messages.empty")}
          </p>
        ) : null}
        {state.drafts.length ? (
          <div className="overflow-visible rounded-md border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800 text-sm">
                <thead className="bg-zinc-900/80">
                  <tr>
                    <Head>{t("crm.client.detail.messages.field.created")}</Head>
                    <Head>{t("crm.client.detail.messages.field.kind")}</Head>
                    <Head>{t("crm.client.detail.messages.field.recipients")}</Head>
                    <Head>{t("crm.client.detail.messages.field.subject")}</Head>
                    <Head>{t("crm.client.detail.messages.field.status")}</Head>
                    <Head alignRight>{t("public.portal.columns.actions")}</Head>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-950/50">
                  {state.drafts.map((draft) => (
                    <tr key={draft.id}>
                      <Cell>{formatDateTime(draft.createdAt, locale)}</Cell>
                      <Cell>{t(kindKeys[draft.documentKind])}</Cell>
                      <Cell>{formatRecipients(draft)}</Cell>
                      <Cell className="max-w-80 truncate">{draft.subject}</Cell>
                      <Cell>
                        <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs font-bold uppercase">
                          {t(statusKeys[draft.status])}
                        </span>
                      </Cell>
                      <Cell alignRight>
                        {draft.status === "draft" ? (
                          <button
                            className="inline-flex h-8 items-center rounded-md border border-zinc-700 px-3 text-xs font-bold text-zinc-200"
                            onClick={() => void markSent(draft.id)}
                            type="button"
                          >
                            {t("crm.client.detail.messages.action.markSent")}
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">-</span>
                        )}
                      </Cell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </ClientDetailSection>
  );
}

function formatRecipients(draft: MessageDraft) {
  if (draft.recipients.length === 0) return "-";
  return draft.recipients.map((recipient) => recipient.email).join(", ");
}

function formatDateTime(value: string, locale: "en" | "es") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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
