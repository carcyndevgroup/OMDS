import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  createPayrollPaymentBatch,
  getPayrollEventDetail,
  listPayrollDashboard,
  recordPayrollPayment,
} from "../repositories/payroll-repository";
import {
  getPayrollPaymentDetail,
  listPayrollPaymentHistory,
} from "../repositories/payroll-payment-repository";
import type { PayrollPaymentFormValues } from "../types/payroll";

export async function createPayrollApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    createBatch: (
      scheduledPayDate: string,
      lineItemIds: string[],
      notes?: string,
    ) => createPayrollPaymentBatch(client, scheduledPayDate, lineItemIds, notes),
    listDashboard: () => listPayrollDashboard(client),
    listPayments: () => listPayrollPaymentHistory(client),
    getPayment: (paymentId: string) => getPayrollPaymentDetail(client, paymentId),
    getEvent: (eventId: string) => getPayrollEventDetail(client, eventId),
    recordPayment: (
      lineItemIds: string[],
      values: PayrollPaymentFormValues,
    ) => recordPayrollPayment(client, lineItemIds, values),
  };
}
