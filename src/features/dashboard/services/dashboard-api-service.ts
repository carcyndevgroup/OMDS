import { createServerSupabaseClient } from "@/core/supabase/server-client";

import {
  getDashboardSummary,
  listDashboardMonthEvents,
  listPendingQuestionnaireReviews,
  listUpcomingDashboardEvents,
} from "../repositories/dashboard-repository";

export async function createDashboardApiService() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) return null;

  return {
    getDashboardSummary: () => getDashboardSummary(client),
    listDashboardMonthEvents: (month: string, includeUnconfirmed = false) =>
      listDashboardMonthEvents(client, month, includeUnconfirmed),
    listPendingQuestionnaireReviews: () =>
      listPendingQuestionnaireReviews(client),
    listUpcomingDashboardEvents: () => listUpcomingDashboardEvents(client),
  };
}
