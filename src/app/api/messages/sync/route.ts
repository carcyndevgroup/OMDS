import { NextResponse } from "next/server";

import { getEmailAdapter } from "@/core/messages/email-adapter-factory";
import type { InboundEmail } from "@/core/messages/email-adapter";
import { createServerSupabaseClient } from "@/core/supabase/server-client";

type ConnectionSettings = { imapCursor?: string };
const ATTACHMENT_BUCKET = "message-attachments";
const maxAttachmentBytes = 25 * 1024 * 1024;

const findOrCreateThread = async (database: Awaited<ReturnType<typeof createServerSupabaseClient>>, email: InboundEmail, connectionId: string) => {
  const references = [...(email.inReplyTo ? [email.inReplyTo] : []), ...email.references];
  const parent = references.length
    ? await database.from("messages").select("thread_id").in("provider_message_id", references).limit(1).maybeSingle()
    : { data: null, error: null };
  if (parent.error) throw new Error("message_parent_lookup_failed");
  if (parent.data) return parent.data.thread_id;

  const providerThreadId = email.messageId;
  const existing = await database
    .from("message_threads")
    .select("id")
    .eq("provider", "email")
    .eq("provider_thread_id", providerThreadId)
    .maybeSingle();
  if (existing.error) throw new Error("thread_lookup_failed");
  if (existing.data) return existing.data.id;

  const created = await database
    .from("message_threads")
    .insert({
      connection_id: connectionId,
      preview: email.bodyText.slice(0, 240),
      provider: "email",
      provider_thread_id: providerThreadId,
      subject: email.subject,
      last_message_at: email.receivedAt,
      unread_count: 1,
    })
    .select("id")
    .single();
  if (created.error) throw new Error("thread_create_failed");
  return created.data.id;
};

const isScheduledRequest = (request: Request) => {
  const configuredSecret = process.env.CRON_SECRET;
  return Boolean(configuredSecret && request.headers.get("x-cron-secret") === configuredSecret);
};

export async function POST(request: Request) {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (!isScheduledRequest(request) && (user.error || !user.data.user)) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const adapterResult = getEmailAdapter();
  if (!adapterResult.adapter || !adapterResult.config) {
    return NextResponse.json({ code: "email_not_configured" }, { status: 409 });
  }

  const connection = await database
    .from("message_connections")
    .select("id, settings")
    .eq("provider", "email")
    .maybeSingle();
  if (connection.error) return NextResponse.json({ code: "connection_load_failed" }, { status: 500 });

  const storedSettings = (connection.data?.settings ?? {}) as ConnectionSettings;
  let synced;
  try {
    synced = await adapterResult.adapter.sync(storedSettings.imapCursor);
  } catch {
    if (connection.data) {
      await database.from("message_connections").update({ status: "error", updated_at: new Date().toISOString() }).eq("id", connection.data.id);
    }
    return NextResponse.json({ code: "email_sync_failed" }, { status: 502 });
  }
  let imported = 0;
  let skipped = 0;
  const connectionId = connection.data?.id ?? crypto.randomUUID();

  if (!connection.data) {
    const created = await database.from("message_connections").insert({
      id: connectionId,
      provider: "email",
      display_name: "Email",
      address: adapterResult.config.address,
      status: "connected",
      settings: {},
    });
    if (created.error) return NextResponse.json({ code: "connection_create_failed" }, { status: 500 });
  }

  for (const email of synced.emails) {
    const duplicate = await database.from("messages").select("id").eq("provider_message_id", email.messageId).maybeSingle();
    if (duplicate.error) throw new Error("message_lookup_failed");
    if (duplicate.data) {
      skipped += 1;
      continue;
    }

    const threadId = await findOrCreateThread(database, email, connectionId);
    const message = await database.from("messages").insert({
      body_html: email.bodyHtml,
      body_text: email.bodyText,
      direction: "inbound",
      provider_message_id: email.messageId,
      sender_address: email.from.address,
      sender_name: email.from.name ?? "",
      sent_at: email.receivedAt,
      subject: email.subject,
      thread_id: threadId,
    }).select("id").single();
    if (message.error) throw new Error("message_create_failed");

    for (const attachment of email.attachments) {
      if (attachment.content.byteLength > maxAttachmentBytes) continue;
      const safeName = attachment.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${threadId}/${message.data.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await database.storage.from(ATTACHMENT_BUCKET).upload(path, attachment.content, {
        contentType: attachment.contentType || "application/octet-stream",
        upsert: false,
      });
      if (upload.error) throw new Error("attachment_upload_failed");
      const attachmentRow = await database.from("message_attachments").insert({
        byte_size: attachment.content.byteLength,
        content_type: attachment.contentType || "application/octet-stream",
        file_name: attachment.fileName,
        message_id: message.data.id,
        storage_path: path,
      });
      if (attachmentRow.error) {
        await database.storage.from(ATTACHMENT_BUCKET).remove([path]);
        throw new Error("attachment_record_failed");
      }
    }

    await database.from("message_participants").insert([
      { address: email.from.address, display_name: email.from.name ?? "", participant_role: "from", thread_id: threadId },
      ...email.to.map((recipient) => ({ address: recipient.address, display_name: recipient.name ?? "", participant_role: "to" as const, thread_id: threadId })),
    ]);
    await database.from("message_threads").update({ last_message_at: email.receivedAt, preview: email.bodyText.slice(0, 240), updated_at: new Date().toISOString() }).eq("id", threadId);
    imported += 1;
  }

  await database.from("message_connections").update({
    address: adapterResult.config.address,
    settings: { ...storedSettings, ...(synced.nextCursor ? { imapCursor: synced.nextCursor } : {}) },
    status: "connected",
    updated_at: new Date().toISOString(),
  }).eq("id", connectionId);

  return NextResponse.json({ data: { imported, skipped, cursor: synced.nextCursor ?? storedSettings.imapCursor ?? null } });
}