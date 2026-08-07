import { beforeEach, describe, expect, it, vi } from "vitest";

import { createContractPdfDocument } from "./document-pdf";
import { renderHtmlToPdf } from "./playwright-pdf";

vi.mock("./playwright-pdf", () => ({
  renderHtmlToPdf: vi.fn().mockResolvedValue(Uint8Array.from([1, 2, 3])),
}));

describe("createContractPdfDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders contract PDFs through the Playwright pipeline", async () => {
    await createContractPdfDocument({
      body: "<p>Contract body</p>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
    });

    expect(renderHtmlToPdf).toHaveBeenCalled();
  });

  it("adds a formal signature section to the rendered contract layout", async () => {
    await createContractPdfDocument({
      body: "<p>Contract body</p>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).toContain("sig-box");
    expect(html).toContain("Authorized Signatures");
    expect(html).toContain("sig-page");
    expect(html).toContain("data:image/png;base64");
  });

  it("uses the configured company profile instead of the legacy hard-coded brand text", async () => {
    await createContractPdfDocument({
      body: "<p>Contract body</p>",
      companyProfile: {
        address: "Calle 123, Cancún",
        dbaName: "Northwind Catering",
        legalName: "Northwind Events S.A. de C.V.",
      },
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).toContain("Northwind Events S.A. de C.V.");
    expect(html).toContain("Northwind Catering");
    expect(html).not.toContain("Oh My Desserts &amp; Snacks MX");
  });

  it("removes USD payment placeholders for MXN-only contracts", async () => {
    await createContractPdfDocument({
      body: "<h2>Payment Schedule</h2><p>*${{financials.retainer_usd}}*</p><p>*${{financials.balance_usd}}*</p>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
      tokenOverrides: {
        "financials.retainer_usd": "",
        "financials.balance_usd": "",
      },
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).not.toContain("financials.retainer_usd");
    expect(html).not.toContain("financials.balance_usd");
    expect(html).not.toContain("*$$*");
  });

  it("removes an unused second quoted line-item row", async () => {
    await createContractPdfDocument({
      body: "<table><tbody><tr><td>{{item.name_1}}</td></tr><tr><td>{{item.name_2}}</td><td>{{item.total_2}}</td></tr></tbody></table>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
      tokenOverrides: { "item.name_1": "Churros" },
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).toContain("Churros");
    expect(html).not.toContain("item.name_2");
    expect(html).not.toContain("item.total_2");
  });

  it("renders signing verification metadata on the signature page", async () => {
    await createContractPdfDocument({
      body: "<p>Contract body</p>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      signingMetadata: {
        authenticationMethod: "client_portal_access_key",
        documentHash: "abc123hash",
        ipAddress: "192.0.2.10",
        signedAt: "2026-07-28T16:15:02.000Z",
        userAgent: "Chrome 128 / macOS 15",
      },
      status: "signed",
      title: "Direct Contract",
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).toContain("Document hash (SHA-256):");
    expect(html).toContain("abc123hash");
    expect(html).toContain("client_portal_access_key");
    expect(html).toContain("192.0.2.10");
    expect(html).toContain("Chrome 128 / macOS 15");
  });

  it("does not render verification metadata when a contract is unsigned", async () => {
    await createContractPdfDocument({
      body: "<p>Contract body</p>",
      issuedAt: "2026-07-28T00:00:00.000Z",
      status: "sent",
      title: "Direct Contract",
    });

    const [html] = vi.mocked(renderHtmlToPdf).mock.calls[0] as [string];

    expect(html).not.toContain("Document hash (SHA-256):");
  });
});
