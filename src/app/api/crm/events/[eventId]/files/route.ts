import { NextResponse } from "next/server";

import { parseEventFileFormValues } from "@/features/crm/files/schemas/event-file-parser";
import { validateEventFileForm } from "@/features/crm/files/schemas/event-file-schema";
import { createEventFileApiService } from "@/features/crm/files/services/event-file-api-service";

type EventFilesRouteContext = { params: Promise<{ eventId: string }> };

export async function GET(_: Request, props: EventFilesRouteContext) {
  const params = await props.params;
  const service = await createEventFileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  return NextResponse.json({ data: await service.list(params.eventId) });
}

export async function POST(request: Request, props: EventFilesRouteContext) {
  const params = await props.params;
  const service = await createEventFileApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  const values = parseEventFileFormValues(body);
  const validation = validateEventFileForm(values);
  if (!validation.isValid) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(
    { data: await service.create(params.eventId, values) },
    { status: 201 },
  );
}
