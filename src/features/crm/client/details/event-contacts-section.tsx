import { Mail, Phone } from "lucide-react";
import Link from "next/link";

import { leadRoleOptions } from "../../lead/constants/lead-options";
import { formatPhone } from "../../shared/utils/phone-format";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

export function EventContactsSection({ client, t }: ClientDetailSectionProps) {
  const contacts = client.event?.contacts ?? [];

  return (
    <ClientDetailSection title={t("crm.client.detail.section.contacts")}>
      {contacts.length ? (
        <div className="divide-y divide-zinc-800">
          {contacts.map((contact) => {
            const roleKey = leadRoleOptions.find(
              (option) => option.value === contact.role,
            )?.translationKey;

            return (
              <div
                className="grid gap-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto]"
                key={contact.clientId}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-cyan-200">
                    {t(
                      contact.isPrimary
                        ? "crm.client.detail.field.primaryContact"
                        : "crm.client.detail.field.secondaryContact",
                    )}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-400">
                    <Link className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100" href={`/messages?compose=1&to=${encodeURIComponent(contact.email)}`}>
                      <Mail aria-hidden="true" size={15} />
                      {contact.email}
                    </Link>
                    <span className="flex items-center gap-2">
                      <Phone aria-hidden="true" size={15} />
                      {formatPhone(contact.phone)}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-zinc-400">
                  {roleKey ? t(roleKey) : t("common.notProvided")}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.contacts")}
        </p>
      )}
    </ClientDetailSection>
  );
}
