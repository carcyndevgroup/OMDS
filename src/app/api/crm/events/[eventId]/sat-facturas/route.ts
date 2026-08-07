import { NextResponse } from "next/server";

import { createEventSatFacturaApiService } from "@/features/crm/financials/services/event-sat-factura-api-service";

type EventSatFacturaRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventSatFacturaRouteContext) {
  const service = await createEventSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}
