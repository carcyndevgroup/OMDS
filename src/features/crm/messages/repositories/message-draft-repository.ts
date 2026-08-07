import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import type { Json } from "@/core/supabase/json.types";

import type {
  MessageDraft,
  MessageDraftCreateInput,
  MessageDraftRecipient,
  MessageDraftStatus,
} from "../types/message-draft";

type MessageDraftRow = Database["public"]["Tables"]["event_message_drafts"]["Row"];

const toRecipients = (value: Json): MessageDraftRecipient[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const email = (item as { email?: unknown }).email;
    const label = (item as { label?: unknown }).label;
    if (typeof email !== "string" || typeof label !== "string") return [];
    return [{ email, label }];
  });
};

const mapDraft = (row: MessageDraftRow): MessageDraft => ({
  body: row.body,
  channel: "email",
  createdAt: row.created_at,
  documentId: row.document_id,
  documentKind: row.document_kind as MessageDraft["documentKind"],
  eventId: row.event_id,
  id: row.id,
  metadata: row.metadata,
  recipients: toRecipients(row.recipients),
  sentAt: row.sent_at,
  status: row.status as MessageDraftStatus,
  subject: row.subject,
  updatedAt: row.updated_at,
});

export async function listMessageDrafts(
  database: SupabaseClient<Database>,
  eventId: string,
) {
  const result = await database
    .from("event_message_drafts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (result.error) throw result.error;
  return result.data.map(mapDraft);
}

export async function createMessageDraft(
  database: SupabaseClient<Database>,
  eventId: string,
  input: MessageDraftCreateInput,
) {
  const result = await database
    .from("event_message_drafts")
    .insert({
      body: input.body,
      document_id: input.documentId,
      document_kind: input.documentKind,
      event_id: eventId,
      metadata: input.metadata ?? {},
      recipients: input.recipients,
      sent_at: input.status === "sent" ? new Date().toISOString() : null,
      status: input.status ?? "draft",
      subject: input.subject,
    })
    .select("*")
    .single();

  if (result.error) throw result.error;
  return mapDraft(result.data);
}

export async function updateMessageDraftStatus(
  database: SupabaseClient<Database>,
  eventId: string,
  messageId: string,
  status: MessageDraftStatus,
) {
  const result = await database
    .from("event_message_drafts")
    .update({
      sent_at: status === "sent" ? new Date().toISOString() : null,
      status,
    })
    .eq("event_id", eventId)
    .eq("id", messageId)
    .select("*")
    .single();

  if (result.error) throw result.error;
  return mapDraft(result.data);
}
