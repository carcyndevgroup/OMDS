import { NextResponse } from "next/server";

import { parseVenueSubLocationFormValues } from "@/features/crm/venue/schemas/venue-sub-location-parser";
import { validateVenueSubLocationForm } from "@/features/crm/venue/schemas/venue-sub-location-schema";
import { createVenueSubLocationApiService } from "@/features/crm/venue/services/venue-sub-location-api-service";

type VenueSubLocationRouteContext = {
  params: { id: string; subLocationId: string };
};

export async function PUT(
  request: Request,
  { params }: VenueSubLocationRouteContext,
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

  const subLocation = await service.update(
    params.id,
    params.subLocationId,
    values,
  );

  return subLocation
    ? NextResponse.json({ data: subLocation })
    : NextResponse.json({ code: "sub_location_not_found" }, { status: 404 });
}
