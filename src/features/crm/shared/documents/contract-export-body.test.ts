import { describe, expect, it } from "vitest";

import { resolveContractExportBody } from "./contract-export-body";

describe("resolveContractExportBody", () => {
  it("prefers the stored contract snapshot body over the current template body", () => {
    expect(
      resolveContractExportBody({
        contractBody: "<p>snapshot body</p>",
        templateBody: "<p>template body</p>",
      }),
    ).toBe("<p>snapshot body</p>");
  });

  it("falls back to the template body when the stored snapshot is empty", () => {
    expect(
      resolveContractExportBody({
        contractBody: "   ",
        templateBody: "<p>template body</p>",
      }),
    ).toBe("<p>template body</p>");
  });
});
