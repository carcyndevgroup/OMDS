import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const BUCKET = "message-attachments";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, props: Context) {
  const params = await props.params;
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const messageId = form.get("messageId");
  const file = form.get("file");
  if (typeof messageId !== "string" || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ code: "attachment_required" }, { status: 400 });
  }
  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ code: "attachment_too_large" }, { status: 413 });
  }

  const message = await database
    .from("messages")
    .select("id, thread_id")
    .eq("id", messageId)
    .eq("thread_id", params.id)
    .maybeSingle();
  if (message.error) return NextResponse.json({ code: "message_load_failed" }, { status: 500 });
  if (!message.data) return NextResponse.json({ code: "message_not_found" }, { status: 404 });

  const path = `${params.id}/${messageId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const upload = await database.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upload.error) return NextResponse.json({ code: "attachment_upload_failed" }, { status: 500 });

  const row = await database
    .from("message_attachments")
    .insert({
      byte_size: file.size,
      content_type: file.type || "application/octet-stream",
      file_name: file.name,
      message_id: messageId,
      storage_path: path,
    })
    .select("*")
    .single();
  if (row.error) {
    await database.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ code: "attachment_record_failed" }, { status: 500 });
  }
  return NextResponse.json({ data: row.data }, { status: 201 });
}
