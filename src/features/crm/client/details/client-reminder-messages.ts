import type { ClientDetailContact } from "../types/client";
import { buildDocumentNumber } from "../../shared/documents/document-identifiers";
import type { Json } from "@/core/supabase/json.types";
import type { MessageDraft } from "../../messages/types/message-draft";
import type { MessageDraftCreateInput, MessageDraftRecipient } from "../../messages/types/message-draft";
import type { Translate } from "../../shared/types/form-types";

type ReminderDocumentKind = "contract" | "invoice" | "questionnaire";

export type ReminderHistoryEntry = {
  actorEmail: string | null;
  sentAt: string;
};

type ReminderMessageProps = {
  contacts: ClientDetailContact[];
  documentId: string;
  documentKind: ReminderDocumentKind;
  t: Translate;
};

export function buildReminderMessageInput(
  props: ReminderMessageProps,
): MessageDraftCreateInput | null {
  const { contacts, documentId, documentKind, t } = props;
  const recipients = buildRecipients(contacts);
  if (!recipients.length) return null;

  const documentNumber = buildDocumentNumber(documentKind, documentId);
  const reminderText = t("crm.client.detail.action.sendReminder");

  return {
    body: `${reminderText}: ${documentNumber}`,
    documentId,
    documentKind,
    metadata: { source: "row_reminder" },
    recipients,
    status: "sent",
    subject: `${reminderText}: ${documentNumber}`,
  };
}

export function getReminderSentAtByDocumentId(
  drafts: MessageDraft[],
  documentKind: ReminderDocumentKind,
) {
  return getReminderMetaByDocumentId(drafts, documentKind);
}

export function getReminderHistoryByDocumentId(
  drafts: MessageDraft[],
  documentKind: ReminderDocumentKind,
) {
  const historyByDocumentId: Record<string, ReminderHistoryEntry[]> = {};

  for (const draft of drafts) {
    if (draft.documentKind !== documentKind) continue;
    if (draft.status !== "sent") continue;
    if (!draft.documentId || !draft.sentAt) continue;
    if (!isRowReminderMetadata(draft.metadata)) continue;

    const existing = historyByDocumentId[draft.documentId] ?? [];
    existing.push({
      actorEmail: getActorEmail(draft.metadata),
      sentAt: draft.sentAt,
    });
    historyByDocumentId[draft.documentId] = existing;
  }

  for (const documentId of Object.keys(historyByDocumentId)) {
    historyByDocumentId[documentId].sort((left, right) =>
      new Date(right.sentAt).getTime() - new Date(left.sentAt).getTime());
  }

  return historyByDocumentId;
}

function getReminderMetaByDocumentId(
  drafts: MessageDraft[],
  documentKind: ReminderDocumentKind,
) {
  const sentAtByDocumentId: Record<string, string> = {};

  for (const draft of drafts) {
    if (draft.documentKind !== documentKind) continue;
    if (draft.status !== "sent") continue;
    if (!draft.documentId || !draft.sentAt) continue;
    if (!isRowReminderMetadata(draft.metadata)) continue;

    const currentSentAt = sentAtByDocumentId[draft.documentId];
    if (!currentSentAt || new Date(draft.sentAt) >= new Date(currentSentAt)) {
      sentAtByDocumentId[draft.documentId] = draft.sentAt;
    }
  }

  return sentAtByDocumentId;
}

function buildRecipients(contacts: ClientDetailContact[]): MessageDraftRecipient[] {
  const seen = new Set<string>();
  const recipients: MessageDraftRecipient[] = [];

  for (const contact of contacts) {
    const email = contact.email.trim();
    if (!email || seen.has(email)) continue;

    seen.add(email);
    recipients.push({
      email,
      label: `${contact.firstName} ${contact.lastName}`.trim(),
    });
  }

  return recipients;
}

function isRowReminderMetadata(metadata: Json) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  return (metadata as Record<string, Json>).source === "row_reminder";
}

function getActorEmail(metadata: Json) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const actorEmail = (metadata as Record<string, Json>).actorEmail;
  return typeof actorEmail === "string" && actorEmail.trim() ? actorEmail.trim() : null;
}
