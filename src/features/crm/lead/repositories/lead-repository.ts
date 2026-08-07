import type { Lead } from "../types/lead";

export type LeadRepository = {
  create: (lead: Lead) => Promise<Lead>;
  delete: (id: string) => Promise<boolean>;
  findById: (id: string) => Promise<Lead | null>;
  list: (includeArchived?: boolean) => Promise<Lead[]>;
  update: (lead: Lead) => Promise<Lead>;
};
