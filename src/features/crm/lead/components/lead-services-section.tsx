import { useState } from "react";

import { serviceGroups } from "../../shared/constants/service-options";
import { CrmFormSection } from "../../shared/components/crm-form-section";
import { ServiceFamilyControl } from "../../shared/components/service-family-control";
import type { LeadSectionProps } from "./lead-form-types";

export function LeadServicesSection({
  errors,
  setFieldValue,
  t,
  values,
}: LeadSectionProps) {
  const [openFamilyId, setOpenFamilyId] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    const hasService = values.serviceIds.includes(serviceId);
    const nextServiceIds = hasService
      ? values.serviceIds.filter((currentId) => currentId !== serviceId)
      : [...values.serviceIds, serviceId];

    setFieldValue("serviceIds", nextServiceIds);
  };

  return (
    <CrmFormSection title={t("crm.lead.section.servicesInterestedIn")}>
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
