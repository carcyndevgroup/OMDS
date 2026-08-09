import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

type DraftPayload = { body?: unknown; leadId?: unknown; subject?: unknown; templateKey?: unknown; to?: unknown };

async function authenticatedRequest() {
  const database = await createServerSupabaseClient();
  const user = await database.auth.getUser();
  if (user.error || !user.data.user) return { database, userId: null };
  return { database, userId: user.data.user.id };
}

export async function GET(request: Request) {
  const { database, userId } = await authenticatedRequest();
  if (!userId) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  const leadId = new URL(request.url).searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ code: "lead_required" }, { status: 400 });
  const result = await database.from("message_drafts").select("*").eq("lead_id", leadId).eq("user_id", userId).maybeSingle();
  if (result.error) return NextResponse.json({ code: "message_draft_load_failed" }, { status: 500 });
  return NextResponse.json({ data: result.data });
}

export async function PUT(request: Request) {
  const { database, userId } = await authenticatedRequest();
  if (!userId) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  let payload: DraftPayload;
  try { payload = (await request.json()) as DraftPayload; } catch { return NextResponse.json({ code: "invalid_json" }, { status: 400 }); }
  if (typeof payload.leadId !== "string" || !payload.leadId) return NextResponse.json({ code: "lead_required" }, { status: 400 });
  const result = await database.from("message_drafts").upsert({ body: typeof payload.body === "string" ? payload.body : "", lead_id: payload.leadId, recipient: typeof payload.to === "string" ? payload.to : "", subject: typeof payload.subject === "string" ? payload.subject : "", template_key: typeof payload.templateKey === "string" ? payload.templateKey : "", updated_at: new Date().toISOString(), user_id: userId }, { onConflict: "user_id,lead_id" }).select("*").single();
  if (result.error) return NextResponse.json({ code: "message_draft_save_failed" }, { status: 500 });
  return NextResponse.json({ data: result.data });
}

export async function DELETE(request: Request) {
  const { database, userId } = await authenticatedRequest();
  if (!userId) return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  const leadId = new URL(request.url).searchParams.get("leadId");
  if (!leadId) return NextResponse.json({ code: "lead_required" }, { status: 400 });
  const result = await database.from("message_drafts").delete().eq("lead_id", leadId).eq("user_id", userId);
  if (result.error) return NextResponse.json({ code: "message_draft_delete_failed" }, { status: 500 });
  return NextResponse.json({ data: null });
}