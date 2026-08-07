import { NextResponse } from "next/server";

import { createEventFileApiService } from "@/features/crm/files/services/event-file-api-service";

type EventFileRouteContext = {
  params: { eventId: string; fileId: string };
};

export async function DELETE(_: Request, { params }: EventFileRouteContext) {
  const service = await createEventFileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.fileId);
  return NextResponse.json({ data: true });
}
