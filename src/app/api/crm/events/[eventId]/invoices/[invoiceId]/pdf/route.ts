import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { createInvoiceApiService } from "@/features/crm/invoice/services/invoice-api-service";
import { getCompanyProfile } from "@/features/settings/company-profile/repositories/company-profile-repository";
import { buildDocumentFilename } from "@/features/crm/shared/documents/document-identifiers";
import { createInvoicePdfDocument } from "@/features/crm/shared/pdf/document-pdf";

type InvoicePdfRouteContext = {
  params: { eventId: string; invoiceId: string };
};

export async function GET(request: Request, { params }: InvoicePdfRouteContext) {
  const service = await createInvoiceApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const invoices = await service.list(params.eventId);
  const invoice = invoices.find((item) => item.id === params.invoiceId);
  if (!invoice) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const database = await createServerSupabaseClient();
  const companyProfile = await getCompanyProfile(database);
  const bytes = await createInvoicePdfDocument(invoice, companyProfile);
  const normalizedBytes = Uint8Array.from(bytes);
  const body = new Blob([normalizedBytes.buffer], { type: "application/pdf" });
  const filename = buildDocumentFilename("invoice", params.invoiceId);

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `${new URL(request.url).searchParams.get("inline") === "1" ? "inline" : "attachment"}; filename=\"${filename}\"`,
      "Content-Type": "application/pdf",
    },
    status: 200,
  });
}
