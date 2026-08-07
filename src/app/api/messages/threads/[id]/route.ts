import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: Context) {
  const params = await props.params;
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const thread = await database
    .from("message_threads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (thread.error) return NextResponse.json({ code: "thread_load_failed" }, { status: 500 });
  if (!thread.data) return NextResponse.json({ code: "thread_not_found" }, { status: 404 });

  const messages = await database
    .from("messages")
    .select("id, thread_id, provider_message_id, in_reply_to_id, direction, sender_address, sender_name, subject, body_text, sent_at, read_at, created_at")
    .eq("thread_id", params.id)
    .order("sent_at", { ascending: true });
  if (messages.error) return NextResponse.json({ code: "messages_load_failed" }, { status: 500 });

  const messageIds = messages.data.map((message) => message.id);
  const attachments = messageIds.length
    ? await database
        .from("message_attachments")
        .select("id, message_id, file_name, content_type, byte_size, storage_path, provider_attachment_id, created_at")
        .in("message_id", messageIds)
    : { data: [], error: null };
  if (attachments.error) return NextResponse.json({ code: "message_attachments_load_failed" }, { status: 500 });

  const attachmentsByMessage = new Map<string, typeof attachments.data>();
  for (const attachment of attachments.data) {
    const current = attachmentsByMessage.get(attachment.message_id) ?? [];
    current.push(attachment);
    attachmentsByMessage.set(attachment.message_id, current);
  }
  const messagesWithAttachments = messages.data.map((message) => ({
    ...message,
    message_attachments: attachmentsByMessage.get(message.id) ?? [],
  }));

  return NextResponse.json({ data: { messages: messagesWithAttachments, thread: thread.data } });
}

export async function PATCH(_: Request, props: Context) {
  const params = await props.params;
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let payload: {
    assignedTo?: string | null;
    clientId?: string | null;
    eventId?: string | null;
    isArchived?: boolean;
    isStarred?: boolean;
    leadId?: string | null;
  } = {};
  try {
    payload = (await _.json()) as typeof payload;
  } catch {
    // An empty PATCH marks the thread as read.
  }

  const updates = {
    ...(payload.assignedTo !== undefined ? { assigned_to: payload.assignedTo } : {}),
    ...(payload.clientId !== undefined ? { client_id: payload.clientId } : {}),
    ...(payload.eventId !== undefined ? { event_id: payload.eventId } : {}),
    ...(payload.isArchived !== undefined ? { is_archived: payload.isArchived } : {}),
    ...(payload.isStarred !== undefined ? { is_starred: payload.isStarred } : {}),
    ...(payload.leadId !== undefined ? { lead_id: payload.leadId } : {}),
    unread_count: 0,
    updated_at: new Date().toISOString(),
  };
  const result = await database
    .from("message_threads")
    .update(updates)
    .eq("id", params.id)
    .select("*")
    .single();
  if (result.error) return NextResponse.json({ code: "thread_update_failed" }, { status: 500 });
  return NextResponse.json({ data: result.data });
}
