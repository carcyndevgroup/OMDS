import { NextResponse } from "next/server";

import { parseEventEquipmentFormValues } from "@/features/crm/equipment/schemas/event-equipment-parser";
import { validateEventEquipmentForm } from "@/features/crm/equipment/schemas/event-equipment-schema";
import { createEventEquipmentApiService } from "@/features/crm/equipment/services/event-equipment-api-service";

type EventEquipmentRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventEquipmentRouteContext) {
  const service = await createEventEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(
  request: Request,
  { params }: EventEquipmentRouteContext,
) {
  const service = await createEventEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventEquipmentFormValues(body);
  const validation = validateEventEquipmentForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: { id: await service.upsert(params.eventId, values) } },
    { status: 201 },
  );
}
