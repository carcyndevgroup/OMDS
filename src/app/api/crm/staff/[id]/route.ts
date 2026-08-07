import { NextResponse } from "next/server";

import { parseStaffFormValues } from "@/features/crm/staff/schemas/staff-parser";
import { validateStaffForm } from "@/features/crm/staff/schemas/staff-schema";
import { createStaffApiService } from "@/features/crm/staff/services/staff-api-service";

type StaffRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: StaffRouteContext) {
  const params = await props.params;
  const service = await createStaffApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const staff = await service.find(params.id);
  return staff
    ? NextResponse.json({ data: staff })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, props: StaffRouteContext) {
  const params = await props.params;
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

  const staff = await service.update(params.id, values);
  return staff
    ? NextResponse.json({ data: staff })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
