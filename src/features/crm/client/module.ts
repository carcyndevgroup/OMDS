import type { CrmModuleDefinition } from "../shared/types/crm-record";

export const clientModule = {
  entity: "client",
  routeSegment: "clients",
} satisfies CrmModuleDefinition;
