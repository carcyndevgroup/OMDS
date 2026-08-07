import { NextResponse } from "next/server";

import { parseEventStaffFormValues } from "@/features/crm/staff/schemas/event-staff-parser";
import { validateEventStaffForm } from "@/features/crm/staff/schemas/event-staff-schema";
import { createEventStaffApiService } from "@/features/crm/staff/services/event-staff-api-service";

type EventStaffRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventStaffRouteContext) {
  const service = await createEventStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: EventStaffRouteContext) {
  const service = await createEventStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventStaffFormValues(body);
  const validation = validateEventStaffForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: { id: await service.upsert(params.eventId, values) } },
    { status: 201 },
  );
}
