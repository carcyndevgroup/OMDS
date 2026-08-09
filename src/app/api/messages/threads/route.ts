import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

export async function GET(request: Request) {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const search = params.get("q")?.trim();
  const provider = params.get("provider");
  const leadId = params.get("leadId");
  const clientId = params.get("clientId");
  const view = params.get("view") ?? "inbox";

  let query = database
    .from("message_threads")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (provider && ["email", "instagram", "facebook", "tiktok"].includes(provider)) {
    query = query.eq("provider", provider);
  }
  if (leadId) query = query.eq("lead_id", leadId);
  if (clientId) query = query.eq("client_id", clientId);
  if (view === "archived") query = query.eq("is_archived", true);
  else if (view === "starred") query = query.eq("is_starred", true).eq("is_archived", false);
  else if (view === "unread") query = query.gt("unread_count", 0).eq("is_archived", false);
  else query = query.eq("is_archived", false);
  if (search) {
    query = query.or(`subject.ilike.%${search}%,preview.ilike.%${search}%`);
  }

  const result = await query;
  if (result.error) {
    return NextResponse.json({ code: "message_threads_load_failed" }, { status: 500 });
  }
  const threadIds = result.data.map((thread) => thread.id);
  const latestMessages = threadIds.length
    ? await database.from("messages").select("thread_id, sender_address, sender_name, sent_at").in("thread_id", threadIds).order("sent_at", { ascending: false })
    : { data: [], error: null };
  if (latestMessages.error) return NextResponse.json({ code: "message_thread_senders_load_failed" }, { status: 500 });
  const senderByThread = new Map<string, (typeof latestMessages.data)[number]>();
  for (const message of latestMessages.data) {
    if (!senderByThread.has(message.thread_id)) senderByThread.set(message.thread_id, message);
  }
  return NextResponse.json({ data: result.data.map((thread) => ({ ...thread, latest_sender_address: senderByThread.get(thread.id)?.sender_address ?? "", latest_sender_name: senderByThread.get(thread.id)?.sender_name ?? "" })) });
}
