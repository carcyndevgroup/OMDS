import { NextResponse } from "next/server";

import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";

type QuoteEventServicesRouteContext = {
  params: Promise<{ eventId: string; quoteId: string; versionId: string }>;
};

export async function POST(_request: Request, props: QuoteEventServicesRouteContext) {
  const params = await props.params;
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const result = await service.applyEventServices(params.eventId, params.versionId);
  return NextResponse.json({ data: result }, { status: 201 });
}
