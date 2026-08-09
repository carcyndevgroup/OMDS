import type { Json } from "./json.types";

export type CrmArchiveAuditEventTable = {
  Row: {
    archived: boolean;
    changed_by: string;
    created_at: string;
    entity: string;
    id: string;
    record_id: string;
  };
  Insert: {
    archived: boolean;
    changed_by: string;
    created_at?: string;
    entity: string;
    id?: string;
    record_id: string;
  };
  Update: Partial<CrmArchiveAuditEventTable["Insert"]>;
  Relationships: [];
};

export type MessageConnectionTable = {
  Row: { id: string; provider: string; display_name: string; address: string | null; status: string; settings: Json; created_at: string; updated_at: string };
  Insert: Partial<MessageConnectionTable["Row"]> & { provider: string; display_name: string };
  Update: Partial<MessageConnectionTable["Insert"]>;
  Relationships: [];
};

export type MessageThreadTable = {
  Row: { id: string; connection_id: string | null; provider: string; provider_thread_id: string | null; subject: string; preview: string; last_message_at: string; unread_count: number; is_starred: boolean; is_archived: boolean; assigned_to: string | null; lead_id: string | null; client_id: string | null; event_id: string | null; labels: string[]; created_at: string; updated_at: string };
  Insert: Partial<MessageThreadTable["Row"]> & { provider: string };
  Update: Partial<MessageThreadTable["Insert"]>;
  Relationships: [];
};

export type MessageParticipantTable = {
  Row: { id: string; thread_id: string; address: string; display_name: string; participant_role: string; created_at: string };
  Insert: Partial<MessageParticipantTable["Row"]> & { thread_id: string; address: string; participant_role: string };
  Update: Partial<MessageParticipantTable["Insert"]>;
  Relationships: [];
};

export type MessageTable = {
  Row: { id: string; thread_id: string; provider_message_id: string | null; in_reply_to_id: string | null; direction: string; sender_address: string; sender_name: string; subject: string; body_text: string; body_html: string | null; sent_at: string; read_at: string | null; created_at: string };
  Insert: Partial<MessageTable["Row"]> & { thread_id: string; direction: string; sender_address: string };
  Update: Partial<MessageTable["Insert"]>;
  Relationships: [];
};

export type MessageAttachmentTable = {
  Row: { id: string; message_id: string; file_name: string; content_type: string; byte_size: number; storage_path: string; provider_attachment_id: string | null; created_at: string };
  Insert: Partial<MessageAttachmentTable["Row"]> & { message_id: string; file_name: string; storage_path: string };
  Update: Partial<MessageAttachmentTable["Insert"]>;
  Relationships: [];
};

export type MessageDraftTable = {
  Row: { id: string; user_id: string; lead_id: string | null; client_id: string | null; recipient: string; subject: string; body: string; template_key: string; created_at: string; updated_at: string };
  Insert: Partial<MessageDraftTable["Row"]> & { user_id: string; lead_id?: string | null; client_id?: string | null };
  Update: Partial<MessageDraftTable["Insert"]>;
  Relationships: [];
};

export type CrmActivityLogTable = {
  Row: {
    actor_id: string | null;
    created_at: string;
    entity: string;
    event_type: string;
    id: string;
    linked_path: string | null;
    record_id: string;
    summary: string;
  };
  Insert: {
    actor_id?: string | null;
    created_at?: string;
    entity: string;
    event_type: string;
    id?: string;
    linked_path?: string | null;
    record_id: string;
    summary: string;
  };
  Update: Partial<CrmActivityLogTable["Insert"]>;
  Relationships: [];
};
export type AppUserTable = {
  Row: {
    created_at: string;
    id: string;
    role: "owner" | "staff";
    updated_at: string;
  };
  Insert: {
    created_at?: string;
    id: string;
    role?: "owner" | "staff";
    updated_at?: string;
  };
  Update: {
    created_at?: string;
    id?: string;
    role?: "owner" | "staff";
    updated_at?: string;
  };
  Relationships: [];
};

export type LeadServiceTable = {
  Row: {
    lead_id: string;
    service_id: string;
  };
  Insert: {
    lead_id: string;
    service_id: string;
  };
  Update: {
    lead_id?: string;
    service_id?: string;
  };
  Relationships: [];
};

export type LeadTable = {
  Row: {
    created_at: string;
    email: string;
    archived_at: string | null;
    event_date: string;
    event_type: string;
    guest_count: number;
    id: string;
    lead_source: string;
    name: string;
    notes: string;
    phone: string;
    role: string;
    status: string;
    updated_at: string;
    venue_id: string | null;
    venue_name: string;
  };
  Insert: {
    created_at?: string;
    email: string;
    archived_at?: string | null;
    event_date: string;
    event_type: string;
    guest_count: number;
    id?: string;
    lead_source: string;
    name: string;
    notes?: string;
    phone: string;
    role: string;
    status?: string;
    updated_at?: string;
    venue_id?: string | null;
    venue_name?: string;
  };
  Update: {
    created_at?: string;
    email?: string;
    archived_at?: string | null;
    event_date?: string;
    event_type?: string;
    guest_count?: number;
    id?: string;
    lead_source?: string;
    name?: string;
    notes?: string;
    phone?: string;
    role?: string;
    status?: string;
    updated_at?: string;
    venue_id?: string | null;
    venue_name?: string;
  };
  Relationships: [];
};
