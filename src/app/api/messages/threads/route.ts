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
  const view = params.get("view") ?? "inbox";

  let query = database
    .from("message_threads")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (provider && ["email", "instagram", "facebook", "tiktok"].includes(provider)) {
    query = query.eq("provider", provider);
  }
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
  return NextResponse.json({ data: result.data });
}
