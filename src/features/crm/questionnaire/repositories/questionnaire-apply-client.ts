import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";
import { contactRoleOptions } from "../../shared/constants/crm-options";

import {
  readString,
  type ClientUpdate,
  type IncludesField,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";

export const resolveSelectedLeadSource = async (
  database: SupabaseClient<Database>,
  primaryClientId: string | null,
) => {
  const fallbackLeadSource = "other";
  if (!primaryClientId) return fallbackLeadSource;

  const primaryClientResult = await database
    .from("clients")
    .select("lead_source")
    .eq("id", primaryClientId)
    .maybeSingle();

  if (primaryClientResult.error) throw primaryClientResult.error;
  return primaryClientResult.data?.lead_source ?? fallbackLeadSource;
};

export const applyPrimaryClientData = async (
  database: SupabaseClient<Database>,
  eventId: string,
  primaryClientId: string | null,
  clientResponse: QuestionnaireResponseRecord,
  includesField: IncludesField,
) => {
  if (!primaryClientId) return;

  const clientUpdate: ClientUpdate = {};

  const facebook = readString(clientResponse.facebook);
  if (includesField("client.facebook") && facebook) clientUpdate.facebook = facebook;

  const instagram = readString(clientResponse.instagram);
  if (includesField("client.instagram") && instagram) clientUpdate.instagram = instagram;

  const legalFirstName = readString(clientResponse.legalFirstName);
  if (includesField("client.legalFirstName") && legalFirstName) {
    clientUpdate.legal_first_name = legalFirstName;
  }

  const legalLastName = readString(clientResponse.legalLastName);
  if (includesField("client.legalLastName") && legalLastName) {
    clientUpdate.legal_last_name = legalLastName;
  }

  const preferredCommunicationMethod = readString(clientResponse.preferredCommunicationMethod);
  if (
    includesField("client.preferredCommunicationMethod")
    && ["email", "whatsapp", "phone"].includes(preferredCommunicationMethod)
  ) {
    clientUpdate.preferred_communication_method = preferredCommunicationMethod;
  }

  const phone = readString(clientResponse.phone);
  if (includesField("client.phone") && phone) clientUpdate.phone = phone;

  const address = readString(clientResponse.address);
  if (address) clientUpdate.street_address = address;

  if (Object.keys(clientUpdate).length > 0) {
    const updateResult = await database
      .from("clients")
      .update(clientUpdate)
      .eq("id", primaryClientId);

    if (updateResult.error) throw updateResult.error;
  }

  const role = readString(clientResponse.role);
  const roleAllowed = contactRoleOptions.some((option) => option.value === role);
  if (!includesField("client.role") || !roleAllowed) return;

  const primaryContactUpdateResult = await database
    .from("event_contacts")
    .update({ role })
    .eq("event_id", eventId)
    .eq("client_id", primaryClientId);

  if (primaryContactUpdateResult.error) throw primaryContactUpdateResult.error;
};
