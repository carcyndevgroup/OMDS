import { NextResponse } from "next/server";

import { createAdminSupabaseClient } from "@/core/supabase/admin-client";
import { payInvoice } from "@/features/crm/invoice/repositories/invoice-repository";
import { getPublicClientPortalAccess } from "@/features/crm/portal/repositories/client-portal-repository";
import { listPublicPortalInvoices } from "@/features/crm/portal/repositories/public-portal-documents-repository";

type InvoiceRouteContext = {
  params: Promise<{ accessKey: string; invoiceId: string }>;
};

export async function PATCH(_: Request, props: InvoiceRouteContext) {
  const params = await props.params;
  const database = createAdminSupabaseClient();
  const portal = await getPublicClientPortalAccess(database, params.accessKey);

  if (!portal || !portal.invoicesVisible) {
    return NextResponse.json({ code: "not_found" }, { status: 404 });
  }

  const invoices = await listPublicPortalInvoices(database, params.accessKey);
  const invoice = invoices.find((item) => item.invoiceId === params.invoiceId);

  if (!invoice || !invoice.clientVisible) {
    return NextResponse.json({ code: "invoice_not_available" }, { status: 404 });
  }

  await payInvoice(database, params.invoiceId);
  return NextResponse.json({ data: true });
}
