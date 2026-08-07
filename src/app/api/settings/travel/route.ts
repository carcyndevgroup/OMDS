import { NextResponse } from "next/server";

import { parseTravelSettings } from "@/features/settings/travel/schemas/travel-settings-parser";
import { validateTravelSettings } from "@/features/settings/travel/schemas/travel-settings-schema";
import { createTravelSettingsApiService } from "@/features/settings/travel/services/travel-settings-api-service";

export async function GET() {
  const service = await createTravelSettingsApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.get() });
}

export async function PUT(request: Request) {
  const service = await createTravelSettingsApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseTravelSettings(body);
  const validation = validateTravelSettings(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.update(values) });
}
