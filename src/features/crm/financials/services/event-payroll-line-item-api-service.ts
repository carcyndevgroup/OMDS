import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  approveEventPayrollLineItem,
  createEventPayrollLineItem,
  deleteEventPayrollLineItem,
  listEventPayrollLineItems,
  updateEventPayrollLineItem,
} from "../repositories/event-payroll-line-item-repository";
import type { EventPayrollLineItemFormValues } from "../types/event-payroll-line-item";

export async function createEventPayrollLineItemApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    approve: (eventId: string, lineItemId: string) =>
      approveEventPayrollLineItem(client, eventId, lineItemId),
    create: (eventId: string, values: EventPayrollLineItemFormValues) =>
      createEventPayrollLineItem(client, eventId, values),
    delete: (eventId: string, lineItemId: string) =>
      deleteEventPayrollLineItem(client, eventId, lineItemId),
    list: (eventId: string) => listEventPayrollLineItems(client, eventId),
    update: (eventId: string, lineItemId: string, values: EventPayrollLineItemFormValues) =>
      updateEventPayrollLineItem(client, eventId, lineItemId, values),
  };
}
