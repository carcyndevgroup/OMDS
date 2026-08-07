import { NextResponse } from "next/server";

import { parseQuoteCreateValues } from "@/features/crm/quote/schemas/quote-parser";
import { validateQuoteCreate } from "@/features/crm/quote/schemas/quote-schema";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type QuotesRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: QuotesRouteContext) {
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: QuotesRouteContext) {
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuoteCreateValues(body);
  const validation = validateQuoteCreate(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const created = await service.create(params.eventId, values);
  await recordClientEventActivity(params.eventId, "quote_created", "Quote created");
  return NextResponse.json({ data: created }, { status: 201 });
}
