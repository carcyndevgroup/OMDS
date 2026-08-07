import { NextResponse } from "next/server";

import { createPlannerEventApiService } from "@/features/crm/planner/services/planner-event-api-service";

type PlannerEventsRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: PlannerEventsRouteContext) {
  const service = await createPlannerEventApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listByPlanner(params.id) });
}
