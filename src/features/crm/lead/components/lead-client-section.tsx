import { leadRoleOptions } from "../constants/lead-options";
import type { LeadRole } from "../types/lead";
import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { PhoneInput } from "../../shared/components/phone-input";
import type { LeadSectionProps } from "./lead-form-types";

export function LeadClientSection({
  errors,
  setFieldValue,
  t,
  values,
}: LeadSectionProps) {
  return (
    <CrmFormSection title={t("crm.lead.section.clientDetails")}>
      <CrmTextInput
        error={errors.name}
        label={t("crm.lead.field.name")}
        onChange={(value) => setFieldValue("name", value)}
        t={t}
        value={values.name}
      />
      <CrmTextInput
        error={errors.email}
        label={t("crm.lead.field.email")}
        onChange={(value) => setFieldValue("email", value)}
        t={t}
        type="email"
        value={values.email}
      />
      <PhoneInput
        error={errors.phone}
        label={t("crm.lead.field.phone")}
        onChange={(value) => setFieldValue("phone", value)}
        t={t}
        value={values.phone}
      />
      <CrmSelect
        error={errors.role}
        label={t("crm.lead.field.role")}
        onChange={(value) => setFieldValue("role", value as LeadRole | "")}
        options={leadRoleOptions}
        t={t}
        value={values.role}
      />
    </CrmFormSection>
  );
}
