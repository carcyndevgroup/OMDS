import { NextResponse } from "next/server";

import { parseQuoteAddProductValues } from "@/features/crm/quote/schemas/quote-parser";
import { validateQuoteProduct } from "@/features/crm/quote/schemas/quote-schema";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";

type QuoteItemsRouteContext = {
  params: { eventId: string; quoteId: string; versionId: string };
};

export async function POST(request: Request, { params }: QuoteItemsRouteContext) {
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuoteAddProductValues(body);
  const validation = validateQuoteProduct(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  await service.addProduct(params.versionId, values);
  return NextResponse.json({ data: true }, { status: 201 });
}
