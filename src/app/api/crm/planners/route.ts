import { NextResponse } from "next/server";

import { parsePlannerFormValues } from "@/features/crm/planner/schemas/planner-parser";
import { createPlannerApiService } from "@/features/crm/planner/services/planner-api-service";

export async function GET() {
  const service = await createPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createPlannerApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.create(parsePlannerFormValues(body));
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ data: result.planner }, { status: 201 });
}
