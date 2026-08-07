export type RetainerDueRule = "contract_signature_invoice_generation";
export type FinalDueRule = "days_before_event" | "none";

export type PaymentPlan = {
  allowAdjustedFinalBalance: boolean;
  createdAt: string;
  finalDueDaysBeforeEvent: string;
  finalDueRule: FinalDueRule;
  finalPaymentPercent: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  refundNotes: string;
  retainerDueRule: RetainerDueRule;
  retainerGracePeriodDays: string;
  retainerPercent: string;
  updatedAt: string;
};

export type PaymentPlanFormValues = Omit<
  PaymentPlan,
  "createdAt" | "id" | "updatedAt"
>;
