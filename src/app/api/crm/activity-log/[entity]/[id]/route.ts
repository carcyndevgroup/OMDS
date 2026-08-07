import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const validEntities = new Set(["leads", "clients"]);

export async function GET(
  _request: Request,
  context: { params: { entity: string; id: string } },
) {
  const { entity, id } = context.params;
  if (!validEntities.has(entity)) {
    return NextResponse.json({ code: "invalid_entity" }, { status: 400 });
  }

  const client = await createServerSupabaseClient();
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const result = await client
    .from("crm_activity_log")
    .select("id, event_type, summary, actor_id, linked_path, created_at")
    .eq("entity", entity)
    .eq("record_id", id)
    .order("created_at", { ascending: false });

  if (result.error) {
    return NextResponse.json({ code: "activity_log_load_failed" }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
}
