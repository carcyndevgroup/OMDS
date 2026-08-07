import { NextResponse } from "next/server";

import { createEventStaffApiService } from "@/features/crm/staff/services/event-staff-api-service";

type EventStaffAssignmentRouteContext = {
  params: { assignmentId: string; eventId: string };
};

export async function DELETE(
  _: Request,
  { params }: EventStaffAssignmentRouteContext,
) {
  const service = await createEventStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.assignmentId);
  return NextResponse.json({ data: true });
}
