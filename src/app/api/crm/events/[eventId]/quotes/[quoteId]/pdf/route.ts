import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { createQuoteApiService } from "@/features/crm/quote/services/quote-api-service";
import { getCompanyProfile } from "@/features/settings/company-profile/repositories/company-profile-repository";
import { buildDocumentFilename } from "@/features/crm/shared/documents/document-identifiers";
import { createQuotePdfDocument } from "@/features/crm/shared/pdf/document-pdf";

type QuotePdfRouteContext = {
  params: { eventId: string; quoteId: string };
};

export async function GET(request: Request, { params }: QuotePdfRouteContext) {
  const service = await createQuoteApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const quotes = await service.list(params.eventId);
  const quote = quotes.find((item) => item.id === params.quoteId);
  if (!quote?.currentVersion) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const database = await createServerSupabaseClient();
  const companyProfile = await getCompanyProfile(database);
  const bytes = await createQuotePdfDocument(quote, quote.currentVersion, companyProfile);
  const normalizedBytes = Uint8Array.from(bytes);
  const body = new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  const filename = buildDocumentFilename("quote", params.quoteId, quote.currentVersion.versionNumber);

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `${new URL(request.url).searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename=\"${filename}\"`,
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}
