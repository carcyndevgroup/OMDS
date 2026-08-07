export type EventSatFacturaStatus =
  | "accountant_requested"
  | "cancelled"
  | "issued"
  | "paid"
  | "partially_paid"
  | "pending"
  | "requested"
  | "sent_to_venue";

export type EventSatFactura = {
  facturaNumber: string;
  id: string;
  issuedAt: string | null;
  notes: string;
  paidAt: string | null;
  recipientName: string;
  rfc: string;
  status: EventSatFacturaStatus;
  subtotalMxn: string;
  taxTotalMxn: string;
  totalMxn: string;
};
