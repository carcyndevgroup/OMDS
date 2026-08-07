import { NextResponse } from "next/server";

import { createEventSatFacturaApiService } from "@/features/crm/financials/services/event-sat-factura-api-service";

type EventSatFacturaRouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_: Request, props: EventSatFacturaRouteContext) {
  const params = await props.params;
  const service = await createEventSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}
