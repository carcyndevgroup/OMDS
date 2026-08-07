import { NextResponse } from "next/server";

import { parsePlannerFormValues } from "@/features/crm/planner/schemas/planner-parser";
import { createPlannerApiService } from "@/features/crm/planner/services/planner-api-service";

type PlannerRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: PlannerRouteContext) {
  const params = await props.params;
  const service = await createPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const planner = await service.findById(params.id);
  return planner
    ? NextResponse.json({ data: planner })
    : NextResponse.json({ code: "planner_not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: PlannerRouteContext) {
  const params = await props.params;
  const service = await createPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.update(params.id, parsePlannerFormValues(body));
  if (!result.ok && "code" in result) {
    return NextResponse.json({ code: result.code }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ data: result.planner });
}
