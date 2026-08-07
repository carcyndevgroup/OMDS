import { NextResponse } from "next/server";

import { parseVenueFormValues } from "@/features/crm/venue/schemas/venue-parser";
import { createVenueApiService } from "@/features/crm/venue/services/venue-api-service";

type VenueRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: VenueRouteContext) {
  const params = await props.params;
  const service = await createVenueApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const venue = await service.findById(params.id);
  return venue
    ? NextResponse.json({ data: venue })
    : NextResponse.json({ code: "venue_not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: VenueRouteContext) {
  const params = await props.params;
  const service = await createVenueApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const result = await service.update(params.id, parseVenueFormValues(body));
  if (!result.ok && "code" in result) {
    return NextResponse.json({ code: result.code }, { status: 404 });
  }
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json({ data: result.venue });
}
