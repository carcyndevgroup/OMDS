import { NextResponse } from "next/server";

import { createInvoiceApiService } from "@/features/crm/invoice/services/invoice-api-service";
import type { InvoiceCreateInput } from "@/features/crm/invoice/types/invoice";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type InvoicesRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: InvoicesRouteContext) {
  const service = await createInvoiceApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, { params }: InvoicesRouteContext) {
  const service = await createInvoiceApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const payload = body as Partial<InvoiceCreateInput>;
  const input: InvoiceCreateInput = {
    amountMxn: typeof payload.amountMxn === "string" ? payload.amountMxn : "",
    dueAt: typeof payload.dueAt === "string" ? payload.dueAt : null,
    isTaxable: payload.isTaxable === true,
    notes: typeof payload.notes === "string" ? payload.notes : "",
    title: typeof payload.title === "string" ? payload.title : "",
  };

  if (!input.title.trim() || !input.amountMxn.trim()) {
    return NextResponse.json({ code: "invalid_payload" }, { status: 400 });
  }

  const created = await service.create(params.eventId, input);
  await recordClientEventActivity(params.eventId, "invoice_created", "Invoice created");
  return NextResponse.json({ data: created }, { status: 201 });
}
