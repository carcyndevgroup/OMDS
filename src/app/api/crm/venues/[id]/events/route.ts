import { NextResponse } from "next/server";

import { createVenueEventApiService } from "@/features/crm/venue/services/venue-event-api-service";

type VenueEventsRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: VenueEventsRouteContext) {
  const service = await createVenueEventApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listByVenue(params.id) });
}
