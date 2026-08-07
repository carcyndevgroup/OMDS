import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";

const entities = {
  clients: "clients",
  leads: "leads",
} as const;

type Entity = keyof typeof entities;

export async function GET(
  _request: Request,
  context: { params: { entity: string; id: string } },
) {
  const entity = context.params.entity as Entity;
  if (!(entity in entities)) {
    return NextResponse.json({ code: "invalid_entity" }, { status: 400 });
  }
  const client = await createServerSupabaseClient();
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }
  const result = await client
    .from("crm_archive_audit_events")
    .select("archived, changed_by, created_at")
    .eq("entity", entity)
    .eq("record_id", context.params.id)
    .order("created_at", { ascending: false });
  if (result.error) {
    return NextResponse.json({ code: "archive_audit_load_failed" }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
}

export async function PATCH(
  request: Request,
  context: { params: { entity: string; id: string } },
) {
  const entity = context.params.entity as Entity;
  if (!(entity in entities)) {
    return NextResponse.json({ code: "invalid_entity" }, { status: 400 });
  }

  const client = await createServerSupabaseClient();
  const user = await client.auth.getUser();
  if (user.error || !user.data.user) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const roleResult = await client
    .from("app_users")
    .select("role")
    .eq("id", user.data.user.id)
    .maybeSingle();
  if (roleResult.error) {
    return NextResponse.json({ code: "authorization_check_failed" }, { status: 500 });
  }
  if (roleResult.data?.role !== "owner") {
    return NextResponse.json({ code: "owner_required" }, { status: 403 });
  }

  let body: { archived: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (typeof body.archived !== "boolean") {
    return NextResponse.json({ code: "invalid_archived_value" }, { status: 400 });
  }

  const result = await client.rpc("set_crm_archive_state", {
    target_archived: body.archived,
    target_entity: entity,
    target_record_id: context.params.id,
  });

  if (result.error) {
    return NextResponse.json({ code: "archive_update_failed" }, { status: 500 });
  }
  if (!result.data) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: result.data });
}