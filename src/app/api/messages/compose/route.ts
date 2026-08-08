import { NextResponse } from "next/server";

import { getEmailAdapter } from "@/core/messages/email-adapter-factory";
import { createServerSupabaseClient } from "@/core/supabase/server-client";

const bucket = "message-attachments";
const maxAttachmentBytes = 25 * 1024 * 1024;
type ComposePayload = { body?: unknown; file?: File; leadId?: unknown; subject?: unknown; to?: unknown };

export async function POST(request: Request) {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  let payload: ComposePayload;
  try {
    const form = await request.formData();
    const file = form.get("file");
    payload = { body: form.get("body"), file: file instanceof File ? file : undefined, leadId: form.get("leadId"), subject: form.get("subject"), to: form.get("to") };
  } catch {
    return NextResponse.json({ code: "invalid_form" }, { status: 400 });
  }
  if (typeof payload.to !== "string" || !payload.to.trim()) return NextResponse.json({ code: "recipient_required" }, { status: 400 });
  if (typeof payload.subject !== "string" || !payload.subject.trim()) return NextResponse.json({ code: "subject_required" }, { status: 400 });
  if (typeof payload.body !== "string" || !payload.body.trim()) return NextResponse.json({ code: "body_required" }, { status: 400 });
  if (payload.file && payload.file.size > maxAttachmentBytes) return NextResponse.json({ code: "attachment_too_large" }, { status: 413 });

  const adapterResult = getEmailAdapter();
  if (!adapterResult.adapter || !adapterResult.config) return NextResponse.json({ code: "email_not_configured" }, { status: 409 });
  let delivery: { providerMessageId: string };
  try {
    delivery = await adapterResult.adapter.send({
      attachments: payload.file ? [{ content: new Uint8Array(await payload.file.arrayBuffer()), contentType: payload.file.type || "application/octet-stream", fileName: payload.file.name }] : undefined,
      bodyText: payload.body.trim(),
      from: { address: adapterResult.config.address },
      subject: payload.subject.trim(),
      to: [{ address: payload.to.trim() }],
    });
  } catch {
    return NextResponse.json({ code: "delivery_failed" }, { status: 502 });
  }

  const now = new Date().toISOString();
  const connection = await database.from("message_connections").select("id").eq("provider", "email").maybeSingle();
  const thread = await database.from("message_threads").insert({ connection_id: connection.data?.id ?? null, lead_id: typeof payload.leadId === "string" ? payload.leadId : null, preview: payload.body.trim().slice(0, 240), provider: "email", provider_thread_id: delivery.providerMessageId, subject: payload.subject.trim(), last_message_at: now }).select("id").single();
  if (thread.error) return NextResponse.json({ code: "thread_create_failed_after_delivery" }, { status: 500 });
  const message = await database.from("messages").insert({ body_text: payload.body.trim(), direction: "outbound", provider_message_id: delivery.providerMessageId, sender_address: adapterResult.config.address, sender_name: adapterResult.config.address, subject: payload.subject.trim(), thread_id: thread.data.id, sent_at: now }).select("*").single();
  if (message.error) return NextResponse.json({ code: "message_create_failed_after_delivery" }, { status: 500 });
  const participant = await database.from("message_participants").insert({ address: payload.to.trim(), participant_role: "to", thread_id: thread.data.id });
  if (participant.error) return NextResponse.json({ code: "participant_create_failed_after_delivery" }, { status: 500 });

  if (payload.file) {
    const safeName = payload.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${thread.data.id}/${message.data.id}/${crypto.randomUUID()}-${safeName}`;
    const upload = await database.storage.from(bucket).upload(path, payload.file, { contentType: payload.file.type || "application/octet-stream", upsert: false });
    if (upload.error) return NextResponse.json({ code: "attachment_upload_failed_after_delivery" }, { status: 500 });
    const row = await database.from("message_attachments").insert({ byte_size: payload.file.size, content_type: payload.file.type || "application/octet-stream", file_name: payload.file.name, message_id: message.data.id, storage_path: path });
    if (row.error) return NextResponse.json({ code: "attachment_record_failed_after_delivery" }, { status: 500 });
  }
  return NextResponse.json({ data: { threadId: thread.data.id } }, { status: 201 });
}
