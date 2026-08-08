import { NextResponse } from "next/server";

import { getEmailAdapter } from "@/core/messages/email-adapter-factory";
import { createServerSupabaseClient } from "@/core/supabase/server-client";

type Context = { params: Promise<{ id: string }> };

type ReplyPayload = { body?: unknown };

export async function POST(request: Request, props: Context) {
  const params = await props.params;
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

  const inbound = await database
    .from("messages")
    .select("sender_address, provider_message_id")
    .eq("thread_id", params.id)
    .eq("direction", "inbound")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (inbound.error) return NextResponse.json({ code: "reply_recipient_load_failed" }, { status: 500 });
  if (!inbound.data?.sender_address) return NextResponse.json({ code: "reply_recipient_missing" }, { status: 409 });

  const adapterResult = getEmailAdapter();
  if (!adapterResult.adapter || !adapterResult.config) return NextResponse.json({ code: "email_not_configured" }, { status: 409 });
  let delivery: { providerMessageId: string };
  try {
    delivery = await adapterResult.adapter.send({
      bodyText: payload.body.trim(),
      from: { address: adapterResult.config.address },
      inReplyTo: inbound.data.provider_message_id ?? undefined,
      subject: thread.data.subject,
      to: [{ address: inbound.data.sender_address }],
    });
  } catch {
    return NextResponse.json({ code: "reply_delivery_failed" }, { status: 502 });
  }

  const now = new Date().toISOString();
  const message = await database
    .from("messages")
    .insert({
      body_text: payload.body.trim(),
      direction: "outbound",
      provider_message_id: delivery.providerMessageId,
      sender_address: user.data.user.email ?? "",
      sender_name: user.data.user.email ?? "",
      subject: thread.data.subject,
      thread_id: params.id,
      sent_at: now,
    })
    .select("*")
    .single();
  if (message.error) return NextResponse.json({ code: "reply_create_failed_after_delivery" }, { status: 500 });

  await database
    .from("message_threads")
    .update({ last_message_at: now, preview: payload.body.trim().slice(0, 240), updated_at: now })
    .eq("id", params.id);

  return NextResponse.json({ data: message.data }, { status: 201 });
}
