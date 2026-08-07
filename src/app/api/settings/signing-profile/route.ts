import { NextResponse } from "next/server";

import { parseSigningProfile } from "@/features/settings/signing-profile/schemas/signing-profile-parser";
import { validateSigningProfile } from "@/features/settings/signing-profile/schemas/signing-profile-schema";
import { createSigningProfileApiService } from "@/features/settings/signing-profile/services/signing-profile-api-service";

export async function GET() {
  const service = await createSigningProfileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.get() });
}

export async function PUT(request: Request) {
  const service = await createSigningProfileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseSigningProfile(body);
  const validation = validateSigningProfile(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  return NextResponse.json({ data: await service.update(values) });
}
