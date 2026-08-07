import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import type { BookingStatus } from "../../shared/types/crm-options";
import { bookingStatusOptions } from "../constants/client-options";
import type { ClientSectionProps } from "./client-form-types";

export function ClientBookingSection(props: ClientSectionProps) {
  const { errors, setFieldValue, t, values } = props;

  return (
    <CrmFormSection title={t("crm.client.section.booking")}>
      <CrmSelect
        error={errors.bookingStatus}
        label={t("crm.client.field.bookingStatus")}
        onChange={(value) => {
          setFieldValue("bookingStatus", value as BookingStatus);
        }}
        options={bookingStatusOptions}
        placeholderKey="crm.client.placeholder.select"
        t={t}
        value={values.bookingStatus}
      />
    </CrmFormSection>
  );
}
