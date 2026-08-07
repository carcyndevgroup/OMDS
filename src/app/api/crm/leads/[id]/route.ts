import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { parseLeadFormValues } from "@/features/crm/lead/schemas/lead-form-parser";
import { createLeadApiService } from "@/features/crm/lead/services/lead-api-service";

type LeadRouteContext = {
  params: Promise<{ id: string }>;
};

const unauthorizedResponse = () => {
  return NextResponse.json({ code: "unauthorized" }, { status: 401 });
};

export async function GET(_: Request, props: LeadRouteContext) {
  const params = await props.params;
  const service = await createLeadApiService();
  if (!service) return unauthorizedResponse();

  const lead = await service.findLeadById(params.id);

  if (!lead) {
    return NextResponse.json({ code: "lead_not_found" }, { status: 404 });
  }

  return NextResponse.json({ data: lead });
}

export async function DELETE(_: Request, props: LeadRouteContext) {
  const params = await props.params;
  const service = await createLeadApiService();
  if (!service) return unauthorizedResponse();

  const didDelete = await service.deleteLead(params.id);

  if (!didDelete) {
    return NextResponse.json({ code: "lead_not_found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: NextRequest, props: LeadRouteContext) {
  const params = await props.params;
  const service = await createLeadApiService();
  if (!service) return unauthorizedResponse();

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.updateLead(
    params.id,
    parseLeadFormValues(body),
  );

  if (!result.ok && "code" in result) {
    return NextResponse.json({ code: result.code }, { status: 404 });
  }

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const previous = await service.findLeadById(params.id);
  const database = await createServerSupabaseClient();
  await database.rpc("record_crm_activity", {
    target_entity: "leads",
    target_event_type: previous?.status !== result.lead.status ? "status_changed" : "updated",
    target_linked_path: `/crm/leads/${params.id}`,
    target_record_id: params.id,
    target_summary: previous?.status !== result.lead.status
      ? `Lead status changed to ${result.lead.status}`
      : "Lead updated",
  });

  return NextResponse.json({ data: result.lead });
}
