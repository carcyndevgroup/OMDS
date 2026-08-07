import { Tag } from "lucide-react";

import { serviceOptions } from "../../shared/constants/service-options";
import { ClientDetailSection } from "./client-detail-section";
import type { ClientDetailSectionProps } from "./client-detail-types";

export function ClientServicesSection({ client, t }: ClientDetailSectionProps) {
  const services = serviceOptions.filter((service) => {
    return client.event?.serviceIds.includes(service.id);
  });

  return (
    <ClientDetailSection title={t("crm.client.detail.section.services")}>
      {services.length ? (
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <span
              className="inline-flex items-center gap-1.5 rounded bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200"
              key={service.id}
            >
              <Tag aria-hidden="true" size={13} />
              {t(service.translationKey)}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {t("crm.client.detail.empty.services")}
        </p>
      )}
    </ClientDetailSection>
  );
}
