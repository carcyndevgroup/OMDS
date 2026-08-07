export type EventPlanner = {
  commissionEligible: boolean;
  commissionPercentageOverride: number | null;
  email: string;
  eventId: string;
  id: string;
  isPrimary: boolean;
  notes: string;
  plannerCompanyName: string;
  plannerId: string;
  plannerName: string;
  role: string;
};

export type EventPlannerFormValues = {
  commissionEligible: boolean;
  commissionPercentageOverride: string;
  isPrimary: boolean;
  notes: string;
  plannerId: string;
  role: string;
};
