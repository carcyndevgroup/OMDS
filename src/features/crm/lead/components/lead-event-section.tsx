import { eventTypeOptions } from "../constants/lead-options";
import type { EventType } from "../types/lead";
import { CrmFormSection } from "../../shared/components/crm-form-section";
import { CrmSelect } from "../../shared/components/crm-select";
import { CrmTextInput } from "../../shared/components/crm-text-input";
import { VenuePicker } from "../../venue/components/venue-picker";
import type { LeadSectionProps } from "./lead-form-types";

export function LeadEventSection({
  errors,
  setFieldValue,
  t,
  values,
  venues,
}: LeadSectionProps) {
  return (
    <CrmFormSection title={t("crm.lead.section.eventDetails")}>
      <CrmSelect
        error={errors.eventType}
        label={t("crm.lead.field.eventType")}
        onChange={(value) => setFieldValue("eventType", value as EventType | "")}
        options={eventTypeOptions}
        t={t}
        value={values.eventType}
      />
      <CrmTextInput
        error={errors.eventDate}
        label={t("crm.lead.field.eventDate")}
        onChange={(value) => setFieldValue("eventDate", value)}
        t={t}
        type="date"
        value={values.eventDate}
      />
      <CrmTextInput
        error={errors.guestCount}
        label={t("crm.lead.field.guestCount")}
        onChange={(value) => setFieldValue("guestCount", value)}
        t={t}
        type="number"
        value={values.guestCount}
      />
      <div>
        <label className="mb-2 block text-sm font-semibold text-zinc-200">{t("crm.lead.field.venueName")}</label>
        <VenuePicker
          name={values.venueName}
          onDraft={(draft) => {
            setFieldValue("venueId", "");
            setFieldValue("venueName", draft.name);
            setFieldValue("venueDraft", draft);
          }}
          onExisting={(venue) => {
            setFieldValue("venueId", venue.id);
            setFieldValue("venueName", venue.name);
            setFieldValue("venueDraft", null);
          }}
          t={t}
          venues={venues}
        />
        {errors.venueName ? <p className="mt-1 text-xs text-rose-300">{t(errors.venueName)}</p> : null}
      </div>
    </CrmFormSection>
  );
}
