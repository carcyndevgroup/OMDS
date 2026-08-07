import { NextResponse } from "next/server";

import { parseExpenseCategoryValues } from "@/features/settings/expense/schemas/expense-category-parser";
import { validateExpenseCategory } from "@/features/settings/expense/schemas/expense-category-schema";
import { createExpenseCategoryApiService } from "@/features/settings/expense/services/expense-category-api-service";

export async function GET() {
  const service = await createExpenseCategoryApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list() });
}

export async function POST(request: Request) {
  const service = await createExpenseCategoryApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseExpenseCategoryValues(body);
  const validation = validateExpenseCategory(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json({ data: await service.create(values) }, { status: 201 });
}
