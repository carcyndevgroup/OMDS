import { NextResponse } from "next/server";

import { parseEquipmentFormValues } from "@/features/settings/equipment/schemas/equipment-parser";
import { validateEquipmentForm } from "@/features/settings/equipment/schemas/equipment-schema";
import { createEquipmentApiService } from "@/features/settings/equipment/services/equipment-api-service";

export async function GET() {
  const service = await createEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEquipmentFormValues(body);
  const validation = validateEquipmentForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
