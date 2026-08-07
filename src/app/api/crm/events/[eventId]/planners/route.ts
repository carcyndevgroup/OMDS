import { NextResponse } from "next/server";

import { parseEventPlannerFormValues } from "@/features/crm/planner/schemas/event-planner-parser";
import { createEventPlannerApiService } from "@/features/crm/planner/services/event-planner-api-service";

type EventPlannersRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventPlannersRouteContext) {
  const service = await createEventPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listByEvent(params.eventId) });
}

export async function POST(request: Request, { params }: EventPlannersRouteContext) {
  const service = await createEventPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.create(params.eventId, parseEventPlannerFormValues(body));
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ data: result.eventPlanner }, { status: 201 });
}
