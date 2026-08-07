import { NextResponse } from "next/server";

import { createPayrollApiService } from "@/features/payroll/services/payroll-api-service";

type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const service = await createPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const payment = await service.getPayment(params.id);
  if (!payment) return NextResponse.json({ code: "payroll_payment_not_found" }, { status: 404 });

  return NextResponse.json({ data: payment });
}
