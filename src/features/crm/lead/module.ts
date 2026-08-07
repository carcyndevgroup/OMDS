import type { CrmModuleDefinition } from "../shared/types/crm-record";

export const leadModule = {
  entity: "lead",
  routeSegment: "leads",
} satisfies CrmModuleDefinition;
