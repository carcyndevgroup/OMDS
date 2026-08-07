export type SatFacturaStatus =
  | "accountant_requested"
  | "cancelled"
  | "issued"
  | "paid"
  | "partially_paid"
  | "pending"
  | "sent_to_venue";

export type SatFacturaRecipientType = "client" | "other" | "venue_hotel";
export type SatComplementoAction = "received" | "requested" | "sent";

export type SatFacturaQueueItem = {
  clientId: string;
  clientName: string;
  dueAt: string | null;
  eventDate: string;
  eventId: string;
  facturaNumber: string;
  id: string;
  recipientName: string;
  recipientType: SatFacturaRecipientType;
  rfc: string;
  status: SatFacturaStatus;
  totalMxn: string;
  venueId: string | null;
  venueName: string;
};

export type SatFacturaDetail = SatFacturaQueueItem & {
  accountantRequestedAt: string | null;
  accountantRequestText: string;
  bankAccountId: string | null;
  cfdiUse: string;
  commissionMxn: string;
  complementoReceivedAt: string | null;
  complementoPdfUrl: string;
  complementoRequestedAt: string | null;
  complementoSentAt: string | null;
  complementoStatus: string;
  complementoXmlUrl: string;
  creationSource: string;
  currency: string;
  exchangeRateSource: string;
  exchangeRateToMxn: string;
  facturaPdfUrl: string;
  facturaXmlUrl: string;
  fiscalProfileId: string | null;
  fiscalProfileLegalName: string;
  fiscalProfileRfc: string;
  issuedAt: string | null;
  ivaMxn: string;
  ivaRetentionMxn: string;
  isrRetentionMxn: string;
  notes: string;
  paidAt: string | null;
  pax: string;
  paymentForm: string;
  paymentMethod: string;
  sentToVenueAt: string | null;
  sourceTotalMxn: string;
  serviceDescription: string;
  subtotalMxn: string;
  taxObject: string;
  taxRegime: string;
  taxTotalMxn: string;
  uuidFiscal: string;
  unitValueMxn: string;
};

export type SatFacturaWorkflowValues = {
  accountantRequestedAt: string;
  complementoPdfUrl: string;
  complementoReceivedAt: string;
  complementoRequestedAt: string;
  complementoSentAt: string;
  complementoStatus: string;
  complementoXmlUrl: string;
  facturaNumber: string;
  facturaPdfUrl: string;
  facturaXmlUrl: string;
  issuedAt: string;
  paidAt: string;
  sentToVenueAt: string;
  status: SatFacturaStatus;
  uuidFiscal: string;
};

export type SatFacturaFormValues = {
  bankAccountId: string;
  accountantRequestText: string;
  cfdiUse: string;
  dueAt: string;
  exchangeRateSource: string;
  exchangeRateToMxn: string;
  eventId: string;
  fiscalProfileId: string;
  ivaMxn: string;
  ivaRetentionMxn: string;
  isrRetentionMxn: string;
  notes: string;
  pax: string;
  paymentForm: string;
  paymentMethod: string;
  recipientName: string;
  recipientType: SatFacturaRecipientType;
  rfc: string;
  serviceDescription: string;
  sourceTotalMxn: string;
  subtotalMxn: string;
  taxObject: string;
  taxRegime: string;
  taxTotalMxn: string;
  totalMxn: string;
  unitValueMxn: string;
};

export type SatFacturaEventDefaults = Partial<SatFacturaFormValues> & {
  quoteItemDescriptions: string[];
  serviceIds: string[];
};

export type SatPaymentAllocationValues = {
  amountMxn: string;
  facturaId: string;
};

export type SatPaymentFormValues = {
  allocations: SatPaymentAllocationValues[];
  amountMxn: string;
  bankAccountId: string;
  notes: string;
  paymentDate: string;
  proofFileUrl: string;
  reference: string;
  venueId: string;
};

export type SatPaymentAllocationItem = {
  amountAppliedMxn: string;
  clientName: string;
  complementoStatus: string;
  facturaId: string;
  facturaNumber: string;
  status: SatFacturaStatus;
  totalMxn: string;
  venueName: string;
};

export type SatPaymentQueueItem = {
  allocationCount: number;
  amountMxn: string;
  bankAccountName: string;
  id: string;
  paymentDate: string;
  proofFileUrl: string;
  reference: string;
  venueName: string;
};

export type SatPaymentDetail = SatPaymentQueueItem & {
  allocations: SatPaymentAllocationItem[];
  notes: string;
};
