import type { CrmRecordMeta } from "../../shared/types/crm-record";

export type Planner = CrmRecordMeta & {
  area: string;
  city: string;
  companyName: string;
  defaultCommissionModel: string;
  defaultCommissionPercentage: number | null;
  email: string;
  instagram: string;
  internalStatus: "active" | "inactive";
  name: string;
  notes: string;
  phone: string;
  preferredContactMethod: string;
  pvCommissionPolicy: string;
  websiteUrl: string;
  whatsapp: string;
};

export type PlannerFormValues = {
  area: string;
  city: string;
  companyName: string;
  defaultCommissionModel: string;
  defaultCommissionPercentage: string;
  email: string;
  instagram: string;
  internalStatus: "active" | "inactive";
  name: string;
  notes: string;
  phone: string;
  preferredContactMethod: string;
  pvCommissionPolicy: string;
  websiteUrl: string;
  whatsapp: string;
};
