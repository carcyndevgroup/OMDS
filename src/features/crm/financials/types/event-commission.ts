export type EventCommissionType = "venue_hotel" | "planner" | "other";
export type EventCommissionModel = "fixed_percentage" | "fixed_amount" | "manual";
export type EventCommissionStatus = "approved" | "estimated" | "paid" | "waived";

export type EventCommission = {
  amountMxn: string;
  baseAmountMxn: string;
  calculationModel: EventCommissionModel;
  commissionType: EventCommissionType;
  id: string;
  notes: string;
  payeeName: string;
  percentage: string;
  relatedPlannerId: string | null;
  relatedVenueId: string | null;
  status: EventCommissionStatus;
};

export type EventCommissionFormValues = {
  amountMxn: string;
  baseAmountMxn: string;
  calculationModel: EventCommissionModel;
  commissionType: EventCommissionType;
  notes: string;
  payeeName: string;
  percentage: string;
  relatedPlannerId: string;
  relatedVenueId: string;
  status: EventCommissionStatus;
};
