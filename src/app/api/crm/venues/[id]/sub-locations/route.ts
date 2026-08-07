import { NextResponse } from "next/server";

import { parseVenueSubLocationFormValues } from "@/features/crm/venue/schemas/venue-sub-location-parser";
import { validateVenueSubLocationForm } from "@/features/crm/venue/schemas/venue-sub-location-schema";
import { createVenueSubLocationApiService } from "@/features/crm/venue/services/venue-sub-location-api-service";

type VenueSubLocationsRouteContext = { params: { id: string } };

export async function GET(
  _: Request,
  { params }: VenueSubLocationsRouteContext,
) {
  const service = await createVenueSubLocationApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listByVenue(params.id) });
}

export async function POST(
  request: Request,
  { params }: VenueSubLocationsRouteContext,
) {
  const service = await createVenueSubLocationApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseVenueSubLocationFormValues(body);
  const validation = validateVenueSubLocationForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: await service.create(params.id, values) },
    { status: 201 },
  );
}
