import { describe, expect, it } from "vitest";

import { renderTemplatePreview } from "./template-token-catalog";

describe("renderTemplatePreview", () => {
  it("renders override token values for company profile data", () => {
    const output = renderTemplatePreview("{{company.legalName}} • {{company.dbaName}}", undefined, {
      "company.legalName": "Oh My Desserts & Snacks MX",
      "company.dbaName": "OMDS Catering",
    });

    expect(output).toContain("Oh My Desserts & Snacks MX");
    expect(output).toContain("OMDS Catering");
  });
});
