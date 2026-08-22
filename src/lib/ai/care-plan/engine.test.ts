import { describe, expect, it } from "vitest";
import { buildCarePlan, computeEnergyBudget } from "./engine";
import { carePlanSchema } from "./types";

describe("computeEnergyBudget", () => {
  it("leaves the budget alone on a low-pain day", () => {
    const b = computeEnergyBudget({ date: "2026-08-22", totalSpoons: 10, spentSpoons: 2, painLevel: 2 });
    expect(b.availableSpoons).toBe(8);
  });

  it("shrinks the budget as pain rises (1 spoon per 2 points above 3)", () => {
    const b = computeEnergyBudget({ date: "2026-08-22", totalSpoons: 10, spentSpoons: 0, painLevel: 7 });
    expect(b.availableSpoons).toBe(8); // penalty = floor((7-3)/2) = 2
    const worse = computeEnergyBudget({ date: "2026-08-22", totalSpoons: 10, spentSpoons: 0, painLevel: 9 });
    expect(worse.availableSpoons).toBe(7); // penalty = 3
  });

  it("never goes below zero and clamps inputs", () => {
    const b = computeEnergyBudget({ date: "2026-08-22", totalSpoons: 99, spentSpoons: 99, painLevel: 99 });
    expect(b.totalSpoons).toBe(12);
    expect(b.availableSpoons).toBe(0);
  });
});

describe("buildCarePlan", () => {
  it("produces a flare-level plan on a high-pain, low-spoon day", () => {
    const plan = buildCarePlan({ date: "2026-08-22", totalSpoons: 4, spentSpoons: 2, painLevel: 8 });
    expect(() => carePlanSchema.parse(plan)).not.toThrow();
    expect(plan.budget.availableSpoons).toBeLessThanOrEqual(2);
    expect(plan.blocks.some((b) => b.type === "sensory-management")).toBe(true);
    expect(plan.blocks.some((b) => b.type === "rest")).toBe(true);
    expect(plan.summary).toMatch(/Flare-level/);
  });

  it("produces a moderate plan with planned rest", () => {
    const plan = buildCarePlan({ date: "2026-08-22", totalSpoons: 8, spentSpoons: 2, painLevel: 6 });
    expect(plan.budget.availableSpoons).toBeGreaterThan(2);
    expect(plan.budget.availableSpoons).toBeLessThanOrEqual(5);
    expect(plan.blocks.some((b) => b.type === "rest")).toBe(true);
    expect(plan.blocks.some((b) => b.type === "gentle-movement")).toBe(true);
  });

  it("produces a capacity plan with graded movement on a good day", () => {
    const plan = buildCarePlan({ date: "2026-08-22", totalSpoons: 12, spentSpoons: 0, painLevel: 1 });
    expect(plan.budget.availableSpoons).toBe(12);
    expect(plan.summary).toMatch(/Capacity day/);
    const movement = plan.blocks.find((b) => b.type === "gentle-movement")!;
    expect(movement.spoonCost).toBeGreaterThan(1);
    expect(movement.minutes).toBeGreaterThanOrEqual(10);
  });

  it("always covers hydration and includes a safety note", () => {
    for (const painLevel of [1, 5, 9]) {
      const plan = buildCarePlan({ date: "2026-08-22", totalSpoons: 8, spentSpoons: 0, painLevel });
      expect(plan.blocks.some((b) => b.type === "hydration")).toBe(true);
      expect(plan.safetyNote.length).toBeGreaterThan(10);
    }
  });

  it("normalizes an invalid date to today", () => {
    const plan = buildCarePlan({ date: "not-a-date", totalSpoons: 8, spentSpoons: 0, painLevel: 3 });
    expect(plan.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
