import { NextResponse } from "next/server";

import { parseStaffFormValues } from "@/features/crm/staff/schemas/staff-parser";
import { validateStaffForm } from "@/features/crm/staff/schemas/staff-schema";
import { createStaffApiService } from "@/features/crm/staff/services/staff-api-service";

export async function GET() {
  const service = await createStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseStaffFormValues(body);
  const validation = validateStaffForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
