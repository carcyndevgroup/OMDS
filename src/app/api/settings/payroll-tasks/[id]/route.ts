import { NextResponse } from "next/server";

import { parsePayrollTaskValues } from "@/features/settings/payroll-task/schemas/payroll-task-parser";
import { validatePayrollTask } from "@/features/settings/payroll-task/schemas/payroll-task-schema";
import { createPayrollTaskApiService } from "@/features/settings/payroll-task/services/payroll-task-api-service";

type PayrollTaskRouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, props: PayrollTaskRouteContext) {
  const params = await props.params;
  const service = await createPayrollTaskApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const task = await service.find(params.id);
  if (!task) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: task });
}

export async function PUT(request: Request, props: PayrollTaskRouteContext) {
  const params = await props.params;
  const service = await createPayrollTaskApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parsePayrollTaskValues(body);
  const validation = validatePayrollTask(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const task = await service.update(params.id, values);
  if (!task) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: task });
}
