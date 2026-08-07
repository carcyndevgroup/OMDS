import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { parseClientFormValues } from "@/features/crm/client/schemas/client-parser";
import { createClientApiService } from "@/features/crm/client/services/client-api-service";

type ConvertLeadRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, props: ConvertLeadRouteContext) {
  const params = await props.params;
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
    params.id,
  );

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  await Promise.all([
    database.rpc("record_crm_activity", {
      target_entity: "leads",
      target_event_type: "converted",
      target_linked_path: `/crm/leads/${params.id}`,
      target_record_id: params.id,
      target_summary: "Lead converted",
    }),
    database.rpc("record_crm_activity", {
      target_entity: "clients",
      target_event_type: "converted_from_lead",
      target_linked_path: `/crm/clients/${result.ids.clientId}`,
      target_record_id: result.ids.clientId,
      target_summary: "Client created from lead",
    }),
  ]);

  return NextResponse.json({ data: result.ids }, { status: 201 });
}
