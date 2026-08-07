import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { PhoneInput } from "../../shared/components/phone-input";
import {
  contactRoleOptions,
  leadSourceOptions,
} from "../../shared/constants/crm-options";
import type {
  ContactRole,
  LeadSource,
} from "../../shared/types/crm-options";
import type { ClientSectionProps } from "./client-form-types";

export function ClientDetailsSection({
  errors,
  setFieldValue,
  t,
  values,
}: ClientSectionProps) {
  return (
    <CrmFormSection title={t("crm.client.section.clientDetails")}>
      <CrmTextInput
        error={errors.firstName}
        label={t("crm.client.field.firstName")}
        onChange={(value) => setFieldValue("firstName", value)}
        t={t}
        value={values.firstName}
      />
      <CrmTextInput
        error={errors.lastName}
        label={t("crm.client.field.lastName")}
        onChange={(value) => setFieldValue("lastName", value)}
        t={t}
        value={values.lastName}
      />
      <CrmTextInput
        error={errors.email}
        label={t("crm.client.field.email")}
        onChange={(value) => setFieldValue("email", value)}
        t={t}
        type="email"
        value={values.email}
      />
      <PhoneInput
        error={errors.phone}
        label={t("crm.client.field.phone")}
        onChange={(value) => setFieldValue("phone", value)}
        t={t}
        value={values.phone}
      />
      <CrmTextInput
        error={errors.companyName}
        label={t("crm.client.field.companyName")}
        onChange={(value) => setFieldValue("companyName", value)}
        t={t}
        value={values.companyName}
      />
      <CrmSelect
        error={errors.role}
        label={t("crm.client.field.role")}
        onChange={(value) => setFieldValue("role", value as ContactRole | "")}
        options={contactRoleOptions}
        placeholderKey="crm.client.placeholder.select"
        t={t}
        value={values.role}
      />
      <CrmSelect
        error={errors.leadSource}
        label={t("crm.client.field.leadSource")}
        onChange={(value) => setFieldValue("leadSource", value as LeadSource | "")}
        options={leadSourceOptions}
        placeholderKey="crm.client.placeholder.select"
        t={t}
        value={values.leadSource}
      />
      <CrmTextInput
        error={errors.streetAddress}
        label={t("crm.client.field.streetAddress")}
        onChange={(value) => setFieldValue("streetAddress", value)}
        t={t}
        value={values.streetAddress}
      />
      <CrmTextInput
        error={errors.city}
        label={t("crm.client.field.city")}
        onChange={(value) => setFieldValue("city", value)}
        t={t}
        value={values.city}
      />
      <CrmTextInput
        error={errors.stateProvince}
        label={t("crm.client.field.stateProvince")}
        onChange={(value) => setFieldValue("stateProvince", value)}
        t={t}
        value={values.stateProvince}
      />
      <CrmTextInput
        error={errors.postalCode}
        label={t("crm.client.field.postalCode")}
        onChange={(value) => setFieldValue("postalCode", value)}
        t={t}
        value={values.postalCode}
      />
      <CrmTextInput
        error={errors.country}
        label={t("crm.client.field.country")}
        onChange={(value) => setFieldValue("country", value)}
        t={t}
        value={values.country}
      />
    </CrmFormSection>
  );
}
