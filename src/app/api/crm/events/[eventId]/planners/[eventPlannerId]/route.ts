import { NextResponse } from "next/server";

import { parseEventPlannerFormValues } from "@/features/crm/planner/schemas/event-planner-parser";
import { createEventPlannerApiService } from "@/features/crm/planner/services/event-planner-api-service";

type EventPlannerRouteContext = {
  params: { eventId: string; eventPlannerId: string };
};

export async function DELETE(_: Request, { params }: EventPlannerRouteContext) {
  const service = await createEventPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.eventPlannerId);
  return new NextResponse(null, { status: 204 });
}

export async function PUT(request: Request, { params }: EventPlannerRouteContext) {
  const service = await createEventPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.update(
    params.eventId,
    params.eventPlannerId,
    parseEventPlannerFormValues(body),
  );

  if (!result.ok && "code" in result) {
    return NextResponse.json({ code: result.code }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ data: result.eventPlanner });
}
