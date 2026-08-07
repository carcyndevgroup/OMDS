import { describe, expect, it } from "vitest";

import { buildContractTokenOverrides } from "./contract-token-resolver";

describe("buildContractTokenOverrides", () => {
  it("maps the standard contract tokens to the resolved contract data", () => {
    const overrides = buildContractTokenOverrides({
      clientAddress: "123 Main St",
      clientFullName: "Jane Doe",
      companyAddress: "Cancún",
      companyDbaName: "OMDS Catering",
      companyEmail: "hello@omds.com",
      companyLegalName: "Oh My Desserts & Snacks MX",
      companyPhone: "+52 998 123 4567",
      companyWebsite: "https://omds.com",
      eventDateFull: "Tuesday, March 2, 2027",
      financials: {
        balanceDueDate: "2027-02-15",
        balanceMxn: 31200,
        retainerMxn: 16800,
        subtotal: 41379.31,
        tax: 6620.69,
        total: 48000,
      },
      items: [{
        description: "Dessert Buffet",
        details: "120-guest premium dessert station",
        quantity: 120,
        totalMxn: 21600,
        unitPriceMxn: 180,
      }],
      paymentPlan: {
        finalPaymentPercent: 60,
        retainerPercent: 40,
      },
      exchangeRateToMxn: 20,
      signerFullName: "Carcyndev Example",
      signerTitle: "Authorized Signer",
      venueName: "Hacienda Aurora",
    });

    expect(overrides).toMatchObject({
      "client.legalfullname": "Jane Doe",
      "client.addressfull": "123 Main St",
      "company.legalName": "Oh My Desserts & Snacks MX",
      "company.dbaName": "OMDS Catering",
      "event.datefull": "Tuesday, March 2, 2027",
      "financials.subtotal": "41,379.31",
      "financials.retainer_mxn": "16,800.00",
      "financials.retainer_percent": "40",
      "financials.balance_due_date": "2027-02-15",
      "financials.balance_mxn": "31,200.00",
      "financials.final_payment_percent": "60",
      "financials.retainer_usd": "840.00",
      "item.name_1": "Dessert Buffet",
      "item.unit_1": "180.00",
      "venue.name": "Hacienda Aurora",
      "omds.legalfullname": "Carcyndev Example",
    });
  });

  it("leaves USD payment references unresolved for MXN-only quotes", () => {
    const overrides = buildContractTokenOverrides({
      displayCurrency: "mxn",
      exchangeRateToMxn: 20,
      financials: { total: 23200 },
      paymentPlan: { finalPaymentPercent: 60, retainerPercent: 40 },
    });

    expect(overrides["financials.retainer_usd"]).toBe("");
    expect(overrides["financials.balance_usd"]).toBe("");
  });
});
