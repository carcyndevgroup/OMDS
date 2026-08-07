import { createServerSupabaseClient } from "@/core/supabase/server-client";

import type { PaymentPlanFormValues } from "../types/payment-plan";
import {
  createPaymentPlan,
  findPaymentPlan,
  listPaymentPlans,
  updatePaymentPlan,
} from "../repositories/payment-plan-repository";

export async function createPaymentPlanApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    create: (values: PaymentPlanFormValues) => createPaymentPlan(client, values),
    find: (id: string) => findPaymentPlan(client, id),
    list: () => listPaymentPlans(client),
    update: (id: string, values: PaymentPlanFormValues) =>
      updatePaymentPlan(client, id, values),
  };
}
