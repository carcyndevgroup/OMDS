import { leadSourceOptions, leadStatusOptions } from "../constants/lead-options";
import type { LeadSource, LeadStatus } from "../types/lead";
import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import type { LeadSectionProps } from "./lead-form-types";

export function LeadOtherSection({
  errors,
  setFieldValue,
  t,
  values,
}: LeadSectionProps) {
  return (
    <CrmFormSection title={t("crm.lead.section.otherInformation")}>
      <div className="md:col-span-2">
        <CrmTextarea
          error={errors.notes}
          label={t("crm.lead.field.notes")}
          onChange={(value) => setFieldValue("notes", value)}
          placeholder={t("crm.lead.placeholder.notes")}
          t={t}
          value={values.notes}
        />
      </div>
      <CrmSelect
        error={errors.leadSource}
        label={t("crm.lead.field.leadSource")}
        onChange={(value) => setFieldValue("leadSource", value as LeadSource | "")}
        options={leadSourceOptions}
        t={t}
        value={values.leadSource}
      />
      <CrmSelect
        error={errors.status}
        label={t("crm.lead.field.status")}
        onChange={(value) => setFieldValue("status", value as LeadStatus)}
        options={leadStatusOptions}
        t={t}
        value={values.status}
      />
    </CrmFormSection>
  );
}
