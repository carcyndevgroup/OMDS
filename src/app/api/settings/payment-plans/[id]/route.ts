import { NextResponse } from "next/server";

import { parsePaymentPlanFormValues } from "@/features/settings/payment-plan/schemas/payment-plan-parser";
import { validatePaymentPlanForm } from "@/features/settings/payment-plan/schemas/payment-plan-schema";
import { createPaymentPlanApiService } from "@/features/settings/payment-plan/services/payment-plan-api-service";

type PaymentPlanRouteContext = { params: { id: string } };

export async function GET(_: Request, { params }: PaymentPlanRouteContext) {
  const service = await createPaymentPlanApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const paymentPlan = await service.find(params.id);
  return paymentPlan
    ? NextResponse.json({ data: paymentPlan })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}

export async function PUT(request: Request, { params }: PaymentPlanRouteContext) {
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

  const paymentPlan = await service.update(params.id, values);
  return paymentPlan
    ? NextResponse.json({ data: paymentPlan })
    : NextResponse.json({ code: "not_found" }, { status: 404 });
}
