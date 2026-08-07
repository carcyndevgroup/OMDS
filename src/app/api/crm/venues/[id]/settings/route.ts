import { NextResponse } from "next/server";

import { parseVenueSettingsFormValues } from "@/features/crm/venue/schemas/venue-settings-parser";
import { createVenueApiService } from "@/features/crm/venue/services/venue-api-service";

type VenueSettingsRouteContext = { params: { id: string } };

export async function PUT(request: Request, { params }: VenueSettingsRouteContext) {
  const service = await createVenueApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const venue = await service.updateSettings(
    params.id,
    parseVenueSettingsFormValues(body),
  );

  return venue
    ? NextResponse.json({ data: venue })
    : NextResponse.json({ code: "venue_not_found" }, { status: 404 });
}
