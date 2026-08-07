import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import type { ClientSectionProps } from "./client-form-types";

export function ClientSocialSection(props: ClientSectionProps) {
  const { errors, setFieldValue, t, values } = props;

  return (
    <CrmFormSection title={t("crm.client.section.socials")}>
      <CrmTextInput
        error={errors.instagram}
        label={t("crm.client.field.instagram")}
        onChange={(value) => setFieldValue("instagram", value)}
        placeholder={t("crm.client.placeholder.instagram")}
        t={t}
        value={values.instagram}
      />
      <CrmTextInput
        error={errors.facebook}
        label={t("crm.client.field.facebook")}
        onChange={(value) => setFieldValue("facebook", value)}
        placeholder={t("crm.client.placeholder.facebook")}
        t={t}
        value={values.facebook}
      />
    </CrmFormSection>
  );
}
