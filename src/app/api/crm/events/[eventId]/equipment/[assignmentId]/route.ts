import { NextResponse } from "next/server";

import { createEventEquipmentApiService } from "@/features/crm/equipment/services/event-equipment-api-service";

type EventEquipmentAssignmentRouteContext = {
  params: Promise<{ assignmentId: string; eventId: string }>;
};

export async function DELETE(_: Request, props: EventEquipmentAssignmentRouteContext) {
  const params = await props.params;
  const service = await createEventEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.assignmentId);
  return NextResponse.json({ data: true });
}
