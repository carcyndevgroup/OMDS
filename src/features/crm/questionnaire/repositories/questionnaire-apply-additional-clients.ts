import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import {
  readString,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";

const allowedAdditionalClientRoles = new Set([
  "bride",
  "groom",
  "parent_family",
  "external_planner",
  "hotel_resort",
  "private_venue",
  "other",
]);

export const applyAdditionalClients = async (
  database: SupabaseClient<Database>,
  eventId: string,
  additionalClients: QuestionnaireResponseRecord[],
  selectedLeadSource: string,
) => {
  for (const additionalClient of additionalClients) {
    const firstName = readString(additionalClient.firstName);
    const lastName = readString(additionalClient.lastName);
    const email = readString(additionalClient.email);
    const phone = readString(additionalClient.phone);
    const role = allowedAdditionalClientRoles.has(readString(additionalClient.role))
      ? readString(additionalClient.role)
      : "other";

    if (!firstName && !lastName && !email && !phone) continue;

    let clientId: string | null = null;
    if (email) {
      const existingByEmail = await database
        .from("clients")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      if (existingByEmail.error) throw existingByEmail.error;
      clientId = existingByEmail.data?.id ?? null;
    }

    if (!clientId && phone && firstName && lastName) {
      const existingByPhone = await database
        .from("clients")
        .select("id")
        .eq("phone", phone)
        .ilike("first_name", firstName)
        .ilike("last_name", lastName)
        .maybeSingle();

      if (existingByPhone.error) throw existingByPhone.error;
      clientId = existingByPhone.data?.id ?? null;
    }

    if (!clientId) {
      const createClientResult = await database
        .from("clients")
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          lead_source: selectedLeadSource,
          phone,
        })
        .select("id")
        .single();

      if (createClientResult.error) throw createClientResult.error;
      clientId = createClientResult.data.id;
    }

    const contactResult = await database
      .from("event_contacts")
      .upsert(
        {
          client_id: clientId,
          event_id: eventId,
          is_primary: false,
          role,
        },
        { onConflict: "event_id,client_id" },
      )
      .select("client_id")
      .single();

    if (contactResult.error) throw contactResult.error;
  }
};
