import { NextResponse } from "next/server";

import { parseBankAccountValues } from "@/features/sat-facturas/schemas/sat-settings-parser";
import { validateBankAccount } from "@/features/sat-facturas/schemas/sat-settings-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

type BankAccountRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: BankAccountRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const data = await service.findBankAccount(params.id);
  if (!data) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data });
}

export async function PUT(request: Request, { params }: BankAccountRouteContext) {
  const service = await createSatFacturaApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseBankAccountValues(body);
  const validation = validateBankAccount(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const data = await service.updateBankAccount(params.id, values);
  if (!data) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data });
}
