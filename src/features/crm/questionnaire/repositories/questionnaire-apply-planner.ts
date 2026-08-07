import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import {
  readString,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";

export const applyPlannerPayload = async (
  database: SupabaseClient<Database>,
  eventId: string,
  plannerPayload: QuestionnaireResponseRecord,
  plannerRole: string,
) => {
  const company = readString(plannerPayload.company);
  const email = readString(plannerPayload.email);
  const firstName = readString(plannerPayload.firstName);
  const lastName = readString(plannerPayload.lastName);
  const phone = readString(plannerPayload.phone);
  const instagram = readString(plannerPayload.instagram);
  const primaryContact = readString(plannerPayload.primaryEventContact) || "no";
  const name = [firstName, lastName].filter(Boolean).join(" ") || company;

  if (!name && !email && !phone) return;

  let plannerId: string | null = null;
  if (email) {
    const existingByEmail = await database
      .from("planners")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existingByEmail.error) throw existingByEmail.error;
    plannerId = existingByEmail.data?.id ?? null;
  }

  if (!plannerId && phone && name) {
    const existingByPhone = await database
      .from("planners")
      .select("id")
      .eq("phone", phone)
      .ilike("name", name)
      .maybeSingle();

    if (existingByPhone.error) throw existingByPhone.error;
    plannerId = existingByPhone.data?.id ?? null;
  }

  if (!plannerId) {
    const createPlannerResult = await database
      .from("planners")
      .insert({
        company_name: company,
        email,
        instagram,
        name,
        notes: `Created from approved booking questionnaire. Primary event contact: ${primaryContact}. Review commission eligibility.`,
        phone,
        preferred_contact_method: email ? "email" : phone ? "phone" : instagram ? "instagram" : "none",
      })
      .select("id")
      .single();

    if (createPlannerResult.error) throw createPlannerResult.error;
    plannerId = createPlannerResult.data.id;
  }

  const eventPlannerResult = await database
    .from("event_planners")
    .upsert(
      {
        commission_eligible: false,
        event_id: eventId,
        is_primary: plannerRole === "primary_planner",
        notes: `Linked from approved booking questionnaire. Primary event contact: ${primaryContact}. Review commission eligibility.`,
        planner_id: plannerId,
        role: plannerRole,
      },
      { onConflict: "event_id,planner_id" },
    )
    .select("id")
    .single();

  if (eventPlannerResult.error) throw eventPlannerResult.error;
};
