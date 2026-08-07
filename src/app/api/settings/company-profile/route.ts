import { NextResponse } from "next/server";

import { parseCompanyProfile } from "@/features/settings/company-profile/schemas/company-profile-parser";
import { validateCompanyProfile } from "@/features/settings/company-profile/schemas/company-profile-schema";
import { createCompanyProfileApiService } from "@/features/settings/company-profile/services/company-profile-api-service";

export async function GET() {
  const service = await createCompanyProfileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.get() });
}

export async function PUT(request: Request) {
  const service = await createCompanyProfileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseCompanyProfile(body);
  const validation = validateCompanyProfile(values);
  if (!validation.isValid) return NextResponse.json({ errors: validation.errors }, { status: 400 });

  return NextResponse.json({ data: await service.update(values) });
}
