import { NextResponse } from "next/server";

import { parseEventExpenseValues } from "@/features/crm/financials/schemas/event-expense-parser";
import { validateEventExpense } from "@/features/crm/financials/schemas/event-expense-schema";
import { createEventExpenseApiService } from "@/features/crm/financials/services/event-expense-api-service";

type EventExpenseRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventExpenseRouteContext) {
  const service = await createEventExpenseApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: EventExpenseRouteContext) {
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

  return NextResponse.json(
    { data: { id: await service.create(params.eventId, values) } },
    { status: 201 },
  );
}
