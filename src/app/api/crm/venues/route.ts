import { NextResponse } from "next/server";

import { parseVenueFormValues } from "@/features/crm/venue/schemas/venue-parser";
import { createVenueApiService } from "@/features/crm/venue/services/venue-api-service";

export async function GET() {
  const service = await createVenueApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createVenueApiService();

  if (!service) {
    return NextResponse.json({ code: "unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await service.create(parseVenueFormValues(body));
    if (!result.ok) {
      return NextResponse.json({ errors: result.errors }, { status: 400 });
    }

    return NextResponse.json({ data: result.venue }, { status: 201 });
  } catch (error) {
    console.error("venue_create_failed", error);
    return NextResponse.json({ code: "venue_create_failed" }, { status: 500 });
  }
}
