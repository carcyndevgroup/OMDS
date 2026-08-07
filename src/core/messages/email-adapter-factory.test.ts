import { describe, expect, it } from "vitest";

import { getEmailAdapter } from "./email-adapter-factory";

describe("getEmailAdapter", () => {
  it("reports missing configuration without throwing", () => {
    const result = getEmailAdapter({});

    expect(result.adapter).toBeNull();
    expect(result.config).toBeNull();
    expect(result.status).toEqual({ configured: false, reason: "missing_configuration" });
  });

  it("validates configuration without exposing credentials", () => {
    const result = getEmailAdapter({
      EMAIL_ADDRESS: "info@example.com",
      EMAIL_IMAP_HOST: "imap.example.com",
      EMAIL_IMAP_PASSWORD: "secret",
      EMAIL_IMAP_USERNAME: "info@example.com",
      EMAIL_SMTP_HOST: "smtp.example.com",
    });

    expect(result.adapter).not.toBeNull();
    expect(result.config?.address).toBe("info@example.com");
    expect(result.config?.imap.password).toBe("secret");
    expect(result.status).toEqual({ configured: true, reason: "ready" });
  });
});
