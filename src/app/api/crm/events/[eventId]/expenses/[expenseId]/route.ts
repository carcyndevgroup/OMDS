import { NextResponse } from "next/server";

import { parseEventExpenseValues } from "@/features/crm/financials/schemas/event-expense-parser";
import { validateEventExpense } from "@/features/crm/financials/schemas/event-expense-schema";
import { createEventExpenseApiService } from "@/features/crm/financials/services/event-expense-api-service";

type EventExpenseItemRouteContext = {
  params: { eventId: string; expenseId: string };
};

export async function PATCH(
  request: Request,
  { params }: EventExpenseItemRouteContext,
) {
  const service = await createEventExpenseApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventExpenseValues(body);
  const validation = validateEventExpense(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({
    data: await service.update(params.eventId, params.expenseId, values),
  });
}

export async function DELETE(
  _: Request,
  { params }: EventExpenseItemRouteContext,
) {
  const service = await createEventExpenseApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.delete(params.eventId, params.expenseId);
  return NextResponse.json({ data: true });
}
