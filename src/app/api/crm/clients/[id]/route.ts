import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { createClientApiService } from "@/features/crm/client/services/client-api-service";
import { parseClientFormValues } from "@/features/crm/client/schemas/client-parser";

type ClientRouteContext = {
  params: { id: string };
};

export async function GET(_: Request, { params }: ClientRouteContext) {
  const service = await createClientApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  const client = await service.findClientById(params.id);

  if (!client) {
    return NextResponse.json({ code: "client_not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: client });
}

export async function PUT(request: Request, { params }: ClientRouteContext) {
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

  if (!body || typeof body !== "object" || !("eventId" in body)) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  const eventId = (body as { eventId?: unknown }).eventId;
  const values = (body as { values?: unknown }).values;

  if (typeof eventId !== "string") {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  const result = await service.updateClientEvent(
    params.id,
    eventId,
    parseClientFormValues(values),
  );

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  await database.rpc("record_crm_activity", {
    target_entity: "clients",
    target_event_type: "updated",
    target_linked_path: `/crm/clients/${params.id}`,
    target_record_id: params.id,
    target_summary: "Client updated",
  });

  return new NextResponse(null, { status: 204 });
}
