import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/core/supabase/server-client";
import { createEventApiService } from "@/features/crm/event/services/event-api-service";
import { updateEventOverview } from "@/features/crm/event/repositories/event-repository";
import { recordClientEventActivity } from "@/features/crm/shared/services/record-client-activity";

type EventRouteContext = { params: { eventId: string } };

export async function GET(_: Request, { params }: EventRouteContext) {
  const service = await createEventApiService();
  if (!service) return NextResponse.json({ code: "unauthorized" }, { status: 401 });

  const event = await service.find(params.eventId);
  if (!event) return NextResponse.json({ code: "not_found" }, { status: 404 });

  return NextResponse.json({ data: event });
}

export async function PUT(request: Request, { params }: EventRouteContext) {
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
    bookingStatus?: string;
    bookingType?: string;
    eventDate?: string;
    guestCount?: number;
    serviceStartTime?: string | null;
  };

  if (
    typeof values.bookingStatus !== "string" ||
    typeof values.bookingType !== "string" ||
    typeof values.eventDate !== "string" ||
    typeof values.guestCount !== "number" ||
    (values.serviceStartTime !== null && typeof values.serviceStartTime !== "string")
  ) {
    return NextResponse.json({ code: "invalid_request" }, { status: 400 });
  }

  await updateEventOverview(client, params.eventId, {
    bookingStatus: values.bookingStatus,
    bookingType: values.bookingType,
    eventDate: values.eventDate,
    guestCount: values.guestCount,
    serviceStartTime: values.serviceStartTime,
  });

  await recordClientEventActivity(params.eventId, "event_updated", "Event updated");

  return new NextResponse(null, { status: 204 });
}
