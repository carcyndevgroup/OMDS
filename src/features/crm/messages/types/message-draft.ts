import type { Json } from "@/core/supabase/json.types";

export type MessageDocumentKind =
  | "questionnaire"
  | "contract"
  | "invoice"
  | "quote"
  | "general";

export type MessageDraftStatus = "draft" | "sent";

export type MessageDraftRecipient = {
  email: string;
  label: string;
};

export type MessageDraft = {
  body: string;
  channel: "email";
  createdAt: string;
  documentId: string | null;
  documentKind: MessageDocumentKind;
  eventId: string;
  id: string;
  metadata: Json;
  recipients: MessageDraftRecipient[];
  sentAt: string | null;
  status: MessageDraftStatus;
  subject: string;
  updatedAt: string;
};

export type MessageDraftCreateInput = {
  body: string;
  documentId: string | null;
  documentKind: MessageDocumentKind;
  metadata?: Json;
  recipients: MessageDraftRecipient[];
  status?: MessageDraftStatus;
  subject: string;
};
