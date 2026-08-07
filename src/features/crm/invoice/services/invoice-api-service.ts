import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createAdHocInvoice,
  listInvoices,
  payInvoice,
  promiseInvoicePayment,
  voidInvoice,
} from "../repositories/invoice-repository";
import type { InvoiceCreateInput } from "../types/invoice";

export async function createInvoiceApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (eventId: string, input: InvoiceCreateInput) =>
      createAdHocInvoice(client, eventId, input),
    list: (eventId: string) => listInvoices(client, eventId),
    pay: (invoiceId: string) => payInvoice(client, invoiceId),
    promise: (invoiceId: string) => promiseInvoicePayment(client, invoiceId),
    void: (invoiceId: string) => voidInvoice(client, invoiceId),
  };
}
