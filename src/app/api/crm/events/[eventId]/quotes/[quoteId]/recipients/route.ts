import { NextResponse } from "next/server";

import { parseQuoteRecipientValues } from "@/features/crm/quote/schemas/quote-parser";
import { validateQuoteRecipients } from "@/features/crm/quote/schemas/quote-schema";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";

type QuoteRecipientsRouteContext = {
  params: { eventId: string; quoteId: string };
};

export async function PUT(
  request: Request,
  { params }: QuoteRecipientsRouteContext,
) {
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseQuoteRecipientValues(body);
  const validation = validateQuoteRecipients(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  await service.updateRecipients(params.quoteId, values);
  return NextResponse.json({ data: true });
}
