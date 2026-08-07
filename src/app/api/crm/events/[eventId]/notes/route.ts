import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { updateEventNotes } from "@/features/crm/event/services/event-notes-service";

type EventNotesRouteContext = { params: Promise<{ eventId: string }> };

export async function PUT(request: Request, props: EventNotesRouteContext) {
  const params = await props.params;
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "invalid_json" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  const values = body as {
    internalIssueNotes?: string;
    notes?: string;
    operationsNotes?: string;
  };

  await updateEventNotes(client, params.eventId, values);
  return new NextResponse(null, { status: 204 });
}
