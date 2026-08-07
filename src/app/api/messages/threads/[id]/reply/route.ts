import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

type Context = { params: { id: string } };

type ReplyPayload = { body?: unknown };

export async function POST(request: Request, { params }: Context) {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let payload: ReplyPayload;
  try {
    payload = (await request.json()) as ReplyPayload;
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }
  if (typeof payload.body !== "string" || !payload.body.trim()) {
    return NextResponse.json({ code: "reply_body_required" }, { status: 400 });
  }

  const thread = await database
    .from("message_threads")
    .select("id, subject")
    .eq("id", params.id)
    .maybeSingle();
  if (thread.error) return NextResponse.json({ code: "thread_load_failed" }, { status: 500 });
  if (!thread.data) return NextResponse.json({ code: "thread_not_found" }, { status: 404 });

  const now = new Date().toISOString();
  const message = await database
    .from("messages")
    .insert({
      body_text: payload.body.trim(),
      direction: "outbound",
      sender_address: user.data.user.email ?? "",
      sender_name: user.data.user.email ?? "",
      subject: thread.data.subject,
      thread_id: params.id,
      sent_at: now,
    })
    .select("*")
    .single();
  if (message.error) return NextResponse.json({ code: "reply_create_failed" }, { status: 500 });

  await database
    .from("message_threads")
    .update({ last_message_at: now, preview: payload.body.trim().slice(0, 240), updated_at: now })
    .eq("id", params.id);

  return NextResponse.json({ data: message.data }, { status: 201 });
}
