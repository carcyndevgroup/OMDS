import { NextResponse } from "next/server";

import { parseVenueContactFormValues } from "@/features/crm/venue/schemas/venue-contact-parser";
import { validateVenueContactForm } from "@/features/crm/venue/schemas/venue-contact-schema";
import { createVenueContactApiService } from "@/features/crm/venue/services/venue-contact-api-service";

type VenueContactRouteContext = { params: { contactId: string; id: string } };

export async function PUT(request: Request, { params }: VenueContactRouteContext) {
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

  const contact = await service.update(params.id, params.contactId, values);
  return contact
    ? NextResponse.json({ data: contact })
    : NextResponse.json({ code: "contact_not_found" }, { status: 404 });
}
