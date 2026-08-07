export type PayrollStatus = "approved" | "estimated" | "paid" | "scheduled" | "waived";

export type PayrollQueueItem = {
  amountMxn: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  id: string;
  notes: string;
  receivingAccountDefault: string;
  scheduledPayDate: string;
  staffName: string;
  staffMemberId: string;
  status: PayrollStatus;
  taskName: string;
  venueName: string;
};

export type PayrollStaffGroup = {
  items: PayrollQueueItem[];
  staffMemberId: string;
  staffName: string;
  totalMxn: string;
};

export type PayrollPayDateGroup = {
  scheduledPayDate: string;
  staffGroups: PayrollStaffGroup[];
  totalMxn: string;
};

export type PayrollSummary = {
  approvedMxn: string;
  dueThisWednesdayMxn: string;
  estimatedMxn: string;
  paidMxn: string;
  paidThisPeriodMxn: string;
  totalPendingMxn: string;
  overdueMxn: string;
  unpaidMxn: string;
  waivedMxn: string;
};

export type PayrollDashboard = {
  groups: PayrollPayDateGroup[];
  items: PayrollQueueItem[];
  summary: PayrollSummary;
};

export type PayrollPaymentFormValues = {
  bonusMxn: string;
  cashCurrency: string;
  notes: string;
  paidAt: string;
  paymentMethod: "cash" | "spei";
  receiptFileUrl: string;
  receivingAccount: string;
  sendingAccount: string;
  transactionId: string;
};

export type PayrollPaymentHistoryItem = {
  bonusMxn: string;
  cashCurrency: string;
  id: string;
  lineItemCount: number;
  paidAt: string;
  paymentMethod: "cash" | "spei";
  receiptFileUrl: string;
  staffNames: string[];
  totalMxn: string;
  transactionId: string;
};

export type PayrollPaymentDetailLine = {
  amountMxn: string;
  clientName: string;
  eventDate: string;
  eventId: string;
  id: string;
  staffName: string;
  taskName: string;
  venueName: string;
};

export type PayrollPaymentDetail = PayrollPaymentHistoryItem & {
  lineItems: PayrollPaymentDetailLine[];
  notes: string;
  receivingAccount: string;
  sendingAccount: string;
};

export type PayrollEventDetail = {
  clientName: string;
  eventDate: string;
  eventId: string;
  lineItems: PayrollQueueItem[];
  paidMxn: string;
  pendingMxn: string;
  totalMxn: string;
  venueName: string;
};

export type PayrollFilters = {
  event: string;
  payDate: string;
  paymentMethod: "" | "cash" | "spei";
  staff: string;
  status: "" | PayrollStatus;
};

export type PayrollPeriodSummary = {
  endDate: string;
  paidMxn: string;
  pendingMxn: string;
  startDate: string;
  title: string;
  totalMxn: string;
};
