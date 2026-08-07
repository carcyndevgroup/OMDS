import { NextResponse } from "next/server";

import { parseProductFormValues } from "@/features/settings/product/schemas/product-parser";
import { validateProductForm } from "@/features/settings/product/schemas/product-schema";
import { createProductApiService } from "@/features/settings/product/services/product-api-service";

type ProductRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: ProductRouteContext) {
  const service = await createProductApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const product = await service.find(params.id);
  if (!product) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: product });
}

export async function PUT(request: Request, { params }: ProductRouteContext) {
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

  const product = await service.update(params.id, values);
  if (!product) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: product });
}
