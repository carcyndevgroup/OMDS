import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { parseClientFormValues } from "@/features/crm/client/schemas/client-parser";
import { createClientApiService } from "@/features/crm/client/services/client-api-service";

export async function GET(request: Request) {
  const service = await createClientApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const includeArchived = new URL(request.url).searchParams.get("includeArchived") === "1";
  const clients = await service.listClients(includeArchived);
  return NextResponse.json({ data: clients });
}

export async function POST(request: NextRequest) {
  const service = await createClientApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.createClientEvent(
    parseClientFormValues(body),
  );

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  await Promise.all([
    database.rpc("record_crm_activity", {
      target_entity: "clients",
      target_event_type: "created",
      target_linked_path: `/crm/clients/${result.ids.clientId}`,
      target_record_id: result.ids.clientId,
      target_summary: "Client created",
    }),
    database.rpc("record_crm_activity", {
      target_entity: "clients",
      target_event_type: "event_created",
      target_linked_path: `/crm/clients/${result.ids.clientId}?tab=overview`,
      target_record_id: result.ids.clientId,
      target_summary: "Client event created",
    }),
  ]);

  return NextResponse.json({ data: result.ids }, { status: 201 });
}
