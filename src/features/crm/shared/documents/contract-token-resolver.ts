type ContractTokenInput = {
  clientAddress?: string | null;
  clientEmail?: string | null;
  clientFullName?: string | null;
  clientPhone?: string | null;
  companyAddress?: string | null;
  companyDbaName?: string | null;
  companyEmail?: string | null;
  companyLegalName?: string | null;
  companyPhone?: string | null;
  companyWebsite?: string | null;
  eventBookingType?: string | null;
  eventDate?: string | null;
  eventDateFull?: string | null;
  eventGuestCount?: string | number | null;
  eventName?: string | null;
  eventServiceEndTime?: string | null;
  eventServiceLocation?: string | null;
  eventServiceStartTime?: string | null;
  eventType?: string | null;
  financials?: {
    balanceDueDate?: string | null;
    balanceMxn?: string | number | null;
    balanceUsd?: string | number | null;
    retainerMxn?: string | number | null;
    retainerUsd?: string | number | null;
    subtotal?: string | number | null;
    tax?: string | number | null;
    total?: string | number | null;
  };
  paymentPlan?: {
    balanceDueDate?: string | null;
    finalPaymentPercent?: string | number | null;
    retainerPercent?: string | number | null;
  };
  exchangeRateToMxn?: string | number | null;
  displayCurrency?: string | null;
  items?: Array<{
    description?: string | null;
    details?: string | null;
    quantity?: string | number | null;
    totalMxn?: string | number | null;
    unitPriceMxn?: string | number | null;
  }>;
  signerFullName?: string | null;
  signerTitle?: string | null;
  venueAddress?: string | null;
  venueContactName?: string | null;
  venueContactPhone?: string | null;
  venueName?: string | null;
};

/**
 * Builds a token override map from resolved contract data.
 * Only tokens that have non-empty values are included so unresolved
 * tokens remain as literal placeholders in the output.
 */
export function buildContractTokenOverrides(input: ContractTokenInput): Record<string, string> {
  const overrides: Record<string, string> = {};

  const set = (key: string, value: string | null | undefined) => {
    if (value?.trim()) overrides[key] = value.trim();
  };

  const setNumber = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && String(value).trim()) {
      overrides[key] = Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const setPercent = (key: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && String(value).trim()) {
      overrides[key] = Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      });
    }
  };

  // Client tokens
  set("client.legalfullname", input.clientFullName);
  set("client.addressfull", input.clientAddress);
  set("client.digitalsignature", input.clientFullName);
  set("client.fullName", input.clientFullName);
  set("client.email", input.clientEmail);
  set("client.phone", input.clientPhone);

  // Company tokens
  set("company.legalName", input.companyLegalName);
  set("company.dbaName", input.companyDbaName);
  set("company.address", input.companyAddress);
  set("company.phone", input.companyPhone);
  set("company.email", input.companyEmail);
  set("company.website", input.companyWebsite);

  // Event tokens
  set("event.name", input.eventName);
  set("event.type", input.eventType);
  set("event.bookingType", input.eventBookingType);
  set("event.date", input.eventDate);
  set("event.datefull", input.eventDateFull);
  set("event.guestCount", input.eventGuestCount != null ? String(input.eventGuestCount) : null);
  set("event.serviceStartTime", input.eventServiceStartTime);
  set("event.serviceEndTime", input.eventServiceEndTime);
  set("event.serviceLocation", input.eventServiceLocation);

  // Venue tokens
  set("venue.name", input.venueName);
  set("venue.address", input.venueAddress);
  set("venue.contactName", input.venueContactName);
  set("venue.contactPhone", input.venueContactPhone);

  // Signing profile tokens
  set("omds.legalfullname", input.signerFullName);
  set("omds.title", input.signerTitle);
  set("omds.digitalsignature", input.signerFullName);
  set("sender.name", input.signerFullName);

  // Financial and accepted quote line-item tokens
  setNumber("financials.subtotal", input.financials?.subtotal);
  setNumber("financials.tax", input.financials?.tax);
  setNumber("financials.total", input.financials?.total);
  setNumber("financials.retainer_mxn", input.financials?.retainerMxn);
  setNumber("financials.balance_mxn", input.financials?.balanceMxn);
  setPercent("financials.retainer_percent", input.paymentPlan?.retainerPercent);
  setPercent("financials.final_payment_percent", input.paymentPlan?.finalPaymentPercent);
  if (input.displayCurrency !== "mxn") {
    setNumber("financials.retainer_usd", input.financials?.retainerUsd);
    setNumber("financials.balance_usd", input.financials?.balanceUsd);
  } else {
    overrides["financials.retainer_usd"] = "";
    overrides["financials.balance_usd"] = "";
  }
  set("financials.balance_due_date", input.financials?.balanceDueDate);

  const total = Number(input.financials?.total);
  const retainerPercent = Number(input.paymentPlan?.retainerPercent);
  const finalPaymentPercent = Number(input.paymentPlan?.finalPaymentPercent);
  if (Number.isFinite(total) && total >= 0) {
    if (!input.financials?.retainerMxn && Number.isFinite(retainerPercent)) {
      setNumber("financials.retainer_mxn", total * retainerPercent / 100);
    }
    if (!input.financials?.balanceMxn && Number.isFinite(finalPaymentPercent)) {
      setNumber("financials.balance_mxn", total * finalPaymentPercent / 100);
    }
    const exchangeRate = Number(input.exchangeRateToMxn);
    if (input.displayCurrency !== "mxn" && exchangeRate > 0) {
      const retainerMxn = input.financials?.retainerMxn ?? total * retainerPercent / 100;
      const balanceMxn = input.financials?.balanceMxn ?? total * finalPaymentPercent / 100;
      setNumber("financials.retainer_usd", Number(retainerMxn) / exchangeRate);
      setNumber("financials.balance_usd", Number(balanceMxn) / exchangeRate);
    }
  }
  if (!input.financials?.balanceDueDate) {
    set("financials.balance_due_date", input.paymentPlan?.balanceDueDate);
  }

  input.items?.slice(0, 2).forEach((item, index) => {
    const itemNumber = index + 1;
    set(`item.name_${itemNumber}`, item.description);
    set(`item.desc_${itemNumber}`, item.details || item.description);
    setNumber(`item.qty_${itemNumber}`, item.quantity);
    setNumber(`item.unit_${itemNumber}`, item.unitPriceMxn);
    setNumber(`item.total_${itemNumber}`, item.totalMxn);
  });

  return overrides;
}
