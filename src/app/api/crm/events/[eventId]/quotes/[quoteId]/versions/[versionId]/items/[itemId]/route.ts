import { NextResponse } from "next/server";

import { parseQuoteUpdateItemValues } from "@/features/crm/quote/schemas/quote-parser";
import { validateQuoteItem } from "@/features/crm/quote/schemas/quote-schema";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";
import type { QuoteMoveDirection } from "@/features/crm/quote/types/quote";

type QuoteItemRouteContext = {
  params: Promise<{
    eventId: string;
    itemId: string;
    quoteId: string;
    versionId: string;
  }>;
};

export async function DELETE(_: Request, props: QuoteItemRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  await service.removeItem(params.versionId, params.itemId);
  return NextResponse.json({ data: true });
}

export async function PATCH(request: Request, props: QuoteItemRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const direction =
    body && typeof body === "object"
      ? (body as { direction?: unknown }).direction
      : null;
  if (direction !== "down" && direction !== "up") {
    return NextResponse.json({ code: "invalid_direction" }, { status: 400 });
  }

  await service.moveItem(
    params.versionId,
    params.itemId,
    direction as QuoteMoveDirection,
  );
  return NextResponse.json({ data: true });
}

export async function PUT(request: Request, props: QuoteItemRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuoteUpdateItemValues(body);
  const validation = validateQuoteItem(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  await service.updateItem(params.versionId, params.itemId, values);
  return NextResponse.json({ data: true });
}
