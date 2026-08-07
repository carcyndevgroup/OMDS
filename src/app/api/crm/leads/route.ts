import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { parseLeadFormValues } from "@/features/crm/lead/schemas/lead-form-parser";
import { createLeadApiService } from "@/features/crm/lead/services/lead-api-service";

const invalidJsonResponse = () => {
  return NextResponse.json({ code: "invalid_json" }, { status: 400 });
};

const unauthorizedResponse = () => {
  return NextResponse.json({ code: "unauthorized" }, { status: 401 });
};

export async function GET(request: Request) {
  const service = await createLeadApiService();
  if (!service) return unauthorizedResponse();

  const includeArchived = new URL(request.url).searchParams.get("includeArchived") === "1";
  const leads = await service.listLeads(includeArchived);

  return NextResponse.json({ data: leads });
}

export async function POST(request: NextRequest) {
  const service = await createLeadApiService();
  if (!service) return unauthorizedResponse();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidJsonResponse();
  }

  const values = parseLeadFormValues(body);
  const result = await service.createLead(values);

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const database = await createServerSupabaseClient();
  await database.rpc("record_crm_activity", {
    target_entity: "leads",
    target_event_type: "created",
    target_linked_path: `/crm/leads/${result.lead.id}`,
    target_record_id: result.lead.id,
    target_summary: "Lead created",
  });

  return NextResponse.json({ data: result.lead }, { status: 201 });
}
