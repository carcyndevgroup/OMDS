import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  buildContractSigningData,
  CONTRACT_ACCEPTANCE_TEXT,
} from "./contract-repository";

describe("buildContractSigningData", () => {
  it("captures consent, verification metadata, and signing events", () => {
    const result = buildContractSigningData({
      accessKey: "portal-key",
      contractBody: "<p>Signed contract</p>",
      existingAudit: [{ at: "2026-08-01T00:00:00.000Z", event: "contract_sent" }],
      ipAddress: "192.0.2.10",
      signedAt: "2026-08-02T00:00:00.000Z",
      userAgent: "Test Browser",
    });

    expect(result.acceptance).toEqual({
      accepted: true,
      acceptedAt: "2026-08-02T00:00:00.000Z",
      accessKey: "portal-key",
      consentText: CONTRACT_ACCEPTANCE_TEXT,
    });
    expect(result.signingMetadata).toMatchObject({
      authenticationMethod: "client_portal_access_key",
      consentText: CONTRACT_ACCEPTANCE_TEXT,
      ipAddress: "192.0.2.10",
      signedAt: "2026-08-02T00:00:00.000Z",
      userAgent: "Test Browser",
    });
    expect(result.signingMetadata.documentHash).toBe(
      createHash("sha256").update("<p>Signed contract</p>", "utf8").digest("hex"),
    );
    expect(result.auditTrail).toEqual([
      { at: "2026-08-01T00:00:00.000Z", event: "contract_sent" },
      { at: "2026-08-02T00:00:00.000Z", event: "terms_accepted", source: "client_portal" },
      { at: "2026-08-02T00:00:00.000Z", event: "contract_signed", source: "client_portal" },
    ]);
  });

  it("allows an explicit consent text while preserving the contract hash", () => {
    const result = buildContractSigningData({
      contractBody: "same body",
      existingAudit: [],
      signedAt: "2026-08-02T00:00:00.000Z",
      consentText: "Custom consent",
    });

    expect(result.acceptance.consentText).toBe("Custom consent");
    expect(result.signingMetadata.documentHash).toBe(
      createHash("sha256").update("same body", "utf8").digest("hex"),
    );
  });
});
