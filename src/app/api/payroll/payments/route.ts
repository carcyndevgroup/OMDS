import { NextResponse } from "next/server";

import { createPayrollApiService } from "@/features/payroll/services/payroll-api-service";
import type { PayrollPaymentFormValues } from "@/features/payroll/types/payroll";

type PaymentRequest = {
  lineItemIds?: string[];
  values?: PayrollPaymentFormValues;
};

export async function POST(request: Request) {
  const service = await createPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const payload = (await request.json()) as PaymentRequest;
  if (!payload.lineItemIds?.length || !payload.values?.paymentMethod) {
    return NextResponse.json({ code: "invalid_payroll_payment" }, { status: 400 });
  }

  const paymentId = await service.recordPayment(payload.lineItemIds, payload.values);
  return NextResponse.json({ data: { id: paymentId } });
}

export async function GET() {
  const service = await createPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const payments = await service.listPayments();
  return NextResponse.json({ data: payments });
}
