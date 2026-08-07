import { NextResponse } from "next/server";

import { parseQuoteUpdateVersionValues } from "@/features/crm/quote/schemas/quote-parser";
import { validateQuoteVersion } from "@/features/crm/quote/schemas/quote-schema";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";

type QuoteVersionRouteContext = {
  params: Promise<{ eventId: string; quoteId: string; versionId: string }>;
};

export async function PUT(request: Request, props: QuoteVersionRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuoteUpdateVersionValues(body);
  const validation = validateQuoteVersion(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  await service.updateVersion(params.versionId, values);
  return NextResponse.json({ data: true });
}
