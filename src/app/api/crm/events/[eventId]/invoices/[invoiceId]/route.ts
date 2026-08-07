import { NextResponse } from "next/server";

import { createInvoiceApiService } from "@/features/crm/invoice/services/invoice-api-service";
import type { InvoiceAction } from "@/features/crm/invoice/types/invoice";

type InvoiceRouteContext = {
  params: Promise<{ eventId: string; invoiceId: string }>;
};

const actions = new Set<InvoiceAction>(["pay", "promise", "void"]);

export async function PATCH(request: Request, props: InvoiceRouteContext) {
  const params = await props.params;
  const service = await createInvoiceApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const action =
    body && typeof body === "object"
      ? (body as { action?: unknown }).action
      : null;

  if (typeof action !== "string" || !actions.has(action as InvoiceAction)) {
    return NextResponse.json({ code: "invalid_action" }, { status: 400 });
  }

  if (action === "promise") await service.promise(params.invoiceId);
  if (action === "pay") await service.pay(params.invoiceId);
  if (action === "void") await service.void(params.invoiceId);

  return NextResponse.json({ data: true });
}
