import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmTextarea } from "../../shared/components/crm-textarea";
import type { ClientSectionProps } from "./client-form-types";

export function ClientOtherSection(props: ClientSectionProps) {
  const { errors, setFieldValue, t, values } = props;

  return (
    <CrmFormSection title={t("crm.client.section.other")}>
      <div className="md:col-span-2">
        <CrmTextarea
          error={errors.notes}
          label={t("crm.lead.field.notes")}
          onChange={(value) => setFieldValue("notes", value)}
          placeholder={t("crm.client.placeholder.notes")}
          t={t}
          value={values.notes}
        />
      </div>
      <div className="md:col-span-2">
        <CrmTextarea
          error={errors.operationsNotes}
          label={t("crm.client.field.operationsNotes")}
          onChange={(value) => setFieldValue("operationsNotes", value)}
          placeholder={t("crm.client.placeholder.operationsNotes")}
          t={t}
          value={values.operationsNotes}
        />
      </div>
      <div className="md:col-span-2">
        <CrmTextarea
          error={errors.internalIssueNotes}
          label={t("crm.client.field.internalIssueNotes")}
          onChange={(value) => setFieldValue("internalIssueNotes", value)}
          placeholder={t("crm.client.placeholder.internalIssueNotes")}
          t={t}
          value={values.internalIssueNotes}
        />
      </div>
    </CrmFormSection>
  );
}
