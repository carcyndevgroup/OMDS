import { useState } from "react";

import { CrmFormSection } from "../../shared/components/crm-form-section";
import { ServiceFamilyControl } from "../../shared/components/service-family-control";
import { serviceGroups } from "../../shared/constants/service-options";
import type { ClientSectionProps } from "./client-form-types";

export function ClientServicesSection({
  errors,
  setFieldValue,
  t,
  values,
}: ClientSectionProps) {
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    const nextIds = values.serviceIds.includes(serviceId)
      ? values.serviceIds.filter((id) => id !== serviceId)
      : [...values.serviceIds, serviceId];

    setFieldValue("serviceIds", nextIds);
  };

  return (
    <CrmFormSection title={t("crm.client.section.services")}>
      <fieldset className="space-y-6 md:col-span-2">
        <legend className="sr-only">{t("crm.lead.field.serviceIds")}</legend>
        {serviceGroups.map((group) => (
          <div className="space-y-3" key={group.category}>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
              {t(group.translationKey)}
            </h3>
            <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.families.map((family) => (
                <ServiceFamilyControl
                  family={family}
                  isOpen={openFamilyId === family.id}
                  key={family.id}
                  onOpenChange={setOpenFamilyId}
                  onToggle={toggleService}
                  selectedIds={values.serviceIds}
                  t={t}
                />
              ))}
            </div>
          </div>
        ))}
        {errors.serviceIds ? (
          <span className="block text-xs font-medium text-rose-300">
            {t(errors.serviceIds)}
          </span>
        ) : null}
      </fieldset>
    </CrmFormSection>
  );
}
