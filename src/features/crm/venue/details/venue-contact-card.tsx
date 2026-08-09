"use client";

import { Mail, Pencil, Phone } from "lucide-react";
import Link from "next/link";

import type { Translate } from "../../shared/types/form-types";
import { formatPhone } from "../../shared/utils/phone-format";
import {
  venueContactMethodOptions,
  venueContactRoleOptions,
} from "../constants/venue-contact-options";
import type { VenueContact } from "../types/venue-contact";

type VenueContactCardProps = {
  contact: VenueContact;
  onEdit: (contact: VenueContact) => void;
  t: Translate;
};

const findLabel = (
  options: { translationKey: Parameters<Translate>[0]; value: string }[],
  value: string,
) => options.find((option) => option.value === value)?.translationKey;

export function VenueContactCard({ contact, onEdit, t }: VenueContactCardProps) {
  const roleKey = findLabel(venueContactRoleOptions, contact.role);
  const methodKey = findLabel(
    venueContactMethodOptions,
    contact.preferredContactMethod,
  );

  return (
    <article className="rounded-md border border-zinc-800 bg-zinc-950/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">{contact.name}</h3>
          <p className="mt-1 text-sm font-semibold text-cyan-200">
            {roleKey ? t(roleKey) : t("common.notProvided")}
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-700 px-3 text-sm font-bold text-zinc-200"
          onClick={() => onEdit(contact)}
          type="button"
        >
          <Pencil aria-hidden="true" size={15} />
          {t("crm.venue.action.edit")}
        </button>
      </div>
      <div className="mt-5 grid gap-3 text-sm font-semibold text-zinc-300 md:grid-cols-2">
        {contact.email ? (
          <Link
            className="inline-flex items-center gap-2 text-cyan-200 hover:text-cyan-100"
            href={`/messages?compose=1&to=${encodeURIComponent(contact.email)}`}
          >
            <Mail aria-hidden="true" size={15} />
            {contact.email}
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2">
            <Mail aria-hidden="true" size={15} />
            {t("common.notProvided")}
          </span>
        )}
        <span className="inline-flex items-center gap-2">
          <Phone aria-hidden="true" size={15} />
          {contact.phone ? formatPhone(contact.phone) : t("common.notProvided")}
        </span>
        <span>{contact.whatsapp ? formatPhone(contact.whatsapp) : t("common.notProvided")}</span>
        <span>{methodKey ? t(methodKey) : t("common.notProvided")}</span>
      </div>
      {contact.notes ? (
        <p className="mt-5 text-sm leading-6 text-zinc-400">{contact.notes}</p>
      ) : null}
      {!contact.isActive ? (
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-500">
          {t("crm.venue.contact.status.inactive")}
        </p>
      ) : null}
    </article>
  );
}
