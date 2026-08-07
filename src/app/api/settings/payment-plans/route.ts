import { NextResponse } from "next/server";

import { parsePaymentPlanFormValues } from "@/features/settings/payment-plan/schemas/payment-plan-parser";
import { validatePaymentPlanForm } from "@/features/settings/payment-plan/schemas/payment-plan-schema";
import { createPaymentPlanApiService } from "@/features/settings/payment-plan/services/payment-plan-api-service";

export async function GET() {
  const service = await createPaymentPlanApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createPaymentPlanApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parsePaymentPlanFormValues(body);
  const validation = validatePaymentPlanForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
