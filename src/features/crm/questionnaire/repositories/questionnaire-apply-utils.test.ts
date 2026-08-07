import { describe, expect, it } from "vitest";

import { createTemplateFieldScope } from "./questionnaire-apply-utils";

describe("createTemplateFieldScope", () => {
  it("treats empty template field sets as unscoped", () => {
    const scope = createTemplateFieldScope(new Set());

    expect(scope.isTemplateScoped).toBe(false);
    expect(scope.includesField("event.eventName")).toBe(true);
    expect(scope.includesField("planner.email")).toBe(true);
    expect(scope.includesAny(["planner.email", "coordinator.phone"])).toBe(true);
  });

  it("only includes configured keys when scoped", () => {
    const scope = createTemplateFieldScope(new Set(["event.eventName", "venue.name"]));

    expect(scope.isTemplateScoped).toBe(true);
    expect(scope.includesField("event.eventName")).toBe(true);
    expect(scope.includesField("venue.name")).toBe(true);
    expect(scope.includesField("planner.email")).toBe(false);
    expect(scope.includesAny(["planner.email", "coordinator.phone"])).toBe(false);
    expect(scope.includesAny(["planner.email", "event.eventName"])).toBe(true);
  });

  it("supports partial template coverage for planner/coordinator gating", () => {
    const plannerOnlyScope = createTemplateFieldScope(
      new Set(["planner.firstName", "planner.email"]),
    );
    const coordinatorOnlyScope = createTemplateFieldScope(
      new Set(["coordinator.phone"]),
    );

    const plannerKeys = [
      "planner.company",
      "planner.firstName",
      "planner.lastName",
      "planner.phone",
      "planner.email",
      "planner.instagram",
      "planner.primaryEventContact",
    ] as const;

    const coordinatorKeys = [
      "coordinator.company",
      "coordinator.firstName",
      "coordinator.lastName",
      "coordinator.phone",
      "coordinator.email",
      "coordinator.instagram",
      "coordinator.primaryEventContact",
    ] as const;

    expect(plannerOnlyScope.includesAny(plannerKeys)).toBe(true);
    expect(plannerOnlyScope.includesAny(coordinatorKeys)).toBe(false);

    expect(coordinatorOnlyScope.includesAny(plannerKeys)).toBe(false);
    expect(coordinatorOnlyScope.includesAny(coordinatorKeys)).toBe(true);
  });
});
