import { NextResponse } from "next/server";

import { parseVenueContactFormValues } from "@/features/crm/venue/schemas/venue-contact-parser";
import { validateVenueContactForm } from "@/features/crm/venue/schemas/venue-contact-schema";
import { createVenueContactApiService } from "@/features/crm/venue/services/venue-contact-api-service";

type VenueContactsRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: VenueContactsRouteContext) {
  const params = await props.params;
  const service = await createVenueContactApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.listByVenue(params.id) });
}

export async function POST(request: Request, props: VenueContactsRouteContext) {
  const params = await props.params;
  const service = await createVenueContactApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseVenueContactFormValues(body);
  const validation = validateVenueContactForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: await service.create(params.id, values) },
    { status: 201 },
  );
}
