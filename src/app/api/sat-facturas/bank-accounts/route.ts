import { NextResponse } from "next/server";

import { parseBankAccountValues } from "@/features/sat-facturas/schemas/sat-settings-parser";
import { validateBankAccount } from "@/features/sat-facturas/schemas/sat-settings-schema";
import { createSatFacturaApiService } from "@/features/sat-facturas/services/sat-factura-api-service";

export async function POST(request: Request) {
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

  return NextResponse.json(
    { data: await service.createBankAccount(values) },
    { status: 201 },
  );
}
