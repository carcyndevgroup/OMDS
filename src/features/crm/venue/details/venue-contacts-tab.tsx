"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useTranslation } from "@/core/i18n";

import { useVenueContactMutation } from "../hooks/use-venue-contact-mutation";
import { useVenueContacts } from "../hooks/use-venue-contacts";
import { initialVenueContactFormValues } from "../schemas/venue-contact-schema";
import type {
  VenueContact,
  VenueContactFormValues,
} from "../types/venue-contact";
import { VenueContactCard } from "./venue-contact-card";
import { VenueContactForm } from "./venue-contact-form";

type VenueContactsTabProps = { venueId: string };

const toFormValues = (contact: VenueContact): VenueContactFormValues => ({
  email: contact.email,
  isActive: contact.isActive,
  name: contact.name,
  notes: contact.notes,
  phone: contact.phone,
  preferredContactMethod: contact.preferredContactMethod,
  role: contact.role,
  whatsapp: contact.whatsapp,
});

export function VenueContactsTab({ venueId }: VenueContactsTabProps) {
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState<VenueContact | null>(null);
  const contacts = useVenueContacts(venueId);
  const createMutation = useVenueContactMutation(venueId);
  const updateMutation = useVenueContactMutation(venueId, editingContact?.id);

  const createContact = async (values: VenueContactFormValues) => {
    await createMutation.mutate(values);
    setIsAdding(false);
    await contacts.refresh();
  };

  const updateContact = async (values: VenueContactFormValues) => {
    await updateMutation.mutate(values);
    setEditingContact(null);
    await contacts.refresh();
  };

  return (
    <section className="space-y-4 rounded-md border border-zinc-800 bg-zinc-900 p-5 shadow-xl shadow-black/20 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("crm.venue.contact.title")}</h2>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            {t("crm.venue.contact.subtitle")}
          </p>
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-bold text-zinc-950"
          onClick={() => setIsAdding(true)}
          type="button"
        >
          <Plus aria-hidden="true" size={17} />
          {t("crm.venue.contact.action.add")}
        </button>
      </div>

      {isAdding ? (
        <VenueContactForm
          initialValues={initialVenueContactFormValues}
          onCancel={() => setIsAdding(false)}
          onSubmit={createContact}
          submitLabel={t("crm.venue.contact.action.save")}
        />
      ) : null}

      {editingContact ? (
        <VenueContactForm
          initialValues={toFormValues(editingContact)}
          onCancel={() => setEditingContact(null)}
          onSubmit={updateContact}
          submitLabel={t("crm.venue.contact.action.update")}
        />
      ) : null}

      {contacts.isLoading ? (
        <p className="text-sm text-zinc-500">{t("crm.venue.contact.loading")}</p>
      ) : null}
      {contacts.hasError ? (
        <p className="text-sm text-rose-300">{t("crm.venue.contact.loadError")}</p>
      ) : null}
      {!contacts.isLoading && contacts.contacts.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-800 p-6 text-sm font-medium text-zinc-500">
          {t("crm.venue.contact.empty")}
        </p>
      ) : null}
      <div className="grid gap-4">
        {contacts.contacts.map((contact) => (
          <VenueContactCard
            contact={contact}
            key={contact.id}
            onEdit={setEditingContact}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
