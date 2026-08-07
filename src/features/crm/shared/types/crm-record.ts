export type CrmEntityKind = "lead" | "client" | "planner" | "venue";

export type CrmRecordMeta = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type CrmModuleDefinition = {
  entity: CrmEntityKind;
  routeSegment: string;
};
