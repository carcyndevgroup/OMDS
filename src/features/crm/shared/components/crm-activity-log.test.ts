import { describe, expect, it } from "vitest";

import { resolveActivityLabel } from "../services/activity-label";

describe("resolveActivityLabel", () => {
  it("localizes known activity event types", () => {
    const translate = (key: string) => `translated:${key}`;

    expect(resolveActivityLabel("message_sent", "Message sent", translate)).toBe(
      "translated:crm.activityLog.event.messageSent",
    );
  });

  it("preserves legacy summaries for unknown event types", () => {
    const translate = (key: string) => key;

    expect(resolveActivityLabel("legacy_event", "Legacy summary", translate)).toBe(
      "Legacy summary",
    );
  });
});