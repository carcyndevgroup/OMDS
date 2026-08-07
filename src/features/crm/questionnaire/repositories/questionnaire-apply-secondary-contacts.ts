import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/core/supabase/database.types";

import {
  buildSecondaryContactDedupKey,
  parseSecondaryContact,
  parseSecondaryContacts,
  readString,
  type IncludesField,
  type QuestionnaireResponseRecord,
} from "./questionnaire-apply-utils";

export const applySecondaryContacts = async (
  database: SupabaseClient<Database>,
  eventId: string,
  additionalResponse: QuestionnaireResponseRecord,
  includesField: IncludesField,
) => {
  const canApply = includesField("additional.secondaryContact")
    || includesField("additional.secondaryContacts");
  if (!canApply) return;

  const structuredSecondaryContacts = parseSecondaryContacts(additionalResponse.secondaryContacts);
  const fallbackSecondaryContact = parseSecondaryContact(additionalResponse.secondaryContact);
  const secondaryContacts = structuredSecondaryContacts.length
    ? structuredSecondaryContacts
    : (fallbackSecondaryContact
      ? [{
        email: "",
        name: fallbackSecondaryContact.name,
        phone: "",
        role: fallbackSecondaryContact.role,
      }]
      : []);

  const existingSecondaryContactsResult = await database
    .from("event_venue_contacts")
    .select("name,email,phone")
    .eq("event_id", eventId);

  if (existingSecondaryContactsResult.error) throw existingSecondaryContactsResult.error;

  const seenSecondaryContactKeys = new Set(
    (existingSecondaryContactsResult.data ?? [])
      .map((contact) =>
        buildSecondaryContactDedupKey({
          email: readString(contact.email),
          name: readString(contact.name),
          phone: readString(contact.phone),
        }),
      )
      .filter(Boolean),
  );

  for (const secondaryContact of secondaryContacts) {
    const dedupKey = buildSecondaryContactDedupKey(secondaryContact);
    if (!secondaryContact.name || seenSecondaryContactKeys.has(dedupKey)) continue;

    const secondaryContactResult = await database
      .from("event_venue_contacts")
      .insert({
        email: secondaryContact.email,
        event_id: eventId,
        name: secondaryContact.name,
        notes: "Created from approved booking questionnaire secondary contact.",
        phone: secondaryContact.phone,
        role: secondaryContact.role,
        should_save_to_venue_profile: false,
      })
      .select("id")
      .single();

    if (secondaryContactResult.error) throw secondaryContactResult.error;
    seenSecondaryContactKeys.add(dedupKey);
  }
};
