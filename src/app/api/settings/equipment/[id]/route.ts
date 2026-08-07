import { NextResponse } from "next/server";

import { parseEquipmentFormValues } from "@/features/settings/equipment/schemas/equipment-parser";
import { validateEquipmentForm } from "@/features/settings/equipment/schemas/equipment-schema";
import { createEquipmentApiService } from "@/features/settings/equipment/services/equipment-api-service";

type EquipmentRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: EquipmentRouteContext) {
  const service = await createEquipmentApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const equipment = await service.find(params.id);
  return equipment
    ? NextResponse.json({ data: equipment })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: EquipmentRouteContext) {
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

  const equipment = await service.update(params.id, values);
  return equipment
    ? NextResponse.json({ data: equipment })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
