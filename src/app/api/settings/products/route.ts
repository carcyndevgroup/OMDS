import { NextResponse } from "next/server";

import { parseProductFormValues } from "@/features/settings/product/schemas/product-parser";
import { validateProductForm } from "@/features/settings/product/schemas/product-schema";
import { createProductApiService } from "@/features/settings/product/services/product-api-service";

export async function GET() {
  const service = await createProductApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createProductApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseProductFormValues(body);
  const validation = validateProductForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
