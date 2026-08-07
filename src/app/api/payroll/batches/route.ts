import { NextResponse } from "next/server";

import { createPayrollApiService } from "@/features/payroll/services/payroll-api-service";

type BatchRequest = {
  lineItemIds?: string[];
  notes?: string;
  scheduledPayDate?: string;
};

export async function POST(request: Request) {
  const service = await createPayrollApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const payload = (await request.json()) as BatchRequest;
  if (!payload.scheduledPayDate || !payload.lineItemIds?.length) {
    return NextResponse.json({ code: "invalid_payroll_batch" }, { status: 400 });
  }

  const batchId = await service.createBatch(
    payload.scheduledPayDate,
    payload.lineItemIds,
    payload.notes,
  );

  return NextResponse.json({ data: { id: batchId } });
}
