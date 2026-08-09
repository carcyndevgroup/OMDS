import { Mail, Phone } from "lucide-react";
import Link from "next/link";

import { leadRoleOptions, leadSourceOptions } from "../../lead/constants/lead-options";
import { formatPhone, phoneHref } from "../../shared/utils/phone-format";
import { ClientDetailField } from "./client-detail-field";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

const communicationKey = (value: string) => {
  if (value === "email") return "public.questionnaire.option.email";
  if (value === "whatsapp") return "public.questionnaire.option.whatsapp";
  if (value === "phone") return "public.questionnaire.option.phone";
  return null;
};

export function ClientInformationSection({
  client,
  t,
}: ClientDetailSectionProps) {
  const primaryContact = client.event?.contacts.find(
    (contact) => contact.clientId === client.id,
  );
  const roleKey = leadRoleOptions.find(
    (option) => option.value === primaryContact?.role,
  )?.translationKey;
  const sourceKey = leadSourceOptions.find(
    (option) => option.value === client.leadSource,
  )?.translationKey;
  const preferredCommunicationKey = communicationKey(
    client.preferredCommunicationMethod,
  );
  const address = [
    client.streetAddress,
    client.city,
    client.stateProvince,
    client.postalCode,
    client.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <ClientDetailSection title={t("crm.client.detail.section.client")}>
      <dl className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <ClientDetailField label={t("crm.client.detail.field.fullName")}>
          {client.firstName} {client.lastName}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.role")}>
          {roleKey ? t(roleKey) : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.legalFirstName")}>
          {client.legalFirstName || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.legalLastName")}>
          {client.legalLastName || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.email")}>
          <Link
            className="inline-flex max-w-full items-center gap-2 text-cyan-200 hover:text-cyan-100"
            href={`/messages?compose=1&to=${encodeURIComponent(client.email)}`}
          >
            <Mail aria-hidden="true" className="shrink-0" size={16} />
            <span className="truncate">{client.email}</span>
          </Link>
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.phone")}>
          <a className="inline-flex items-center gap-2" href={phoneHref(client.phone)}>
            <Phone aria-hidden="true" size={16} />
            {formatPhone(client.phone)}
          </a>
        </ClientDetailField>
        <ClientDetailField label={t("public.questionnaire.field.preferredCommunication")}>
          {preferredCommunicationKey
            ? t(preferredCommunicationKey)
            : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.company")}>
          {client.companyName || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.field.leadSource")}>
          {sourceKey ? t(sourceKey) : t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.address")}>
          {address || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.instagram")}>
          {client.instagram || t("common.notProvided")}
        </ClientDetailField>
        <ClientDetailField label={t("crm.client.detail.field.facebook")}>
          {client.facebook || t("common.notProvided")}
        </ClientDetailField>
      </dl>
    </ClientDetailSection>
  );
}
