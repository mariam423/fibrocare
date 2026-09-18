import { describe, expect, it } from "vitest";
import {
  CycleLogSchema,
  FogLogInputSchema,
  MealItemInputSchema,
  MealLogInputSchema,
  SymptomLogSchema,
  TriggerFoodInputSchema,
} from "./health";

describe("MealItemInputSchema", () => {
  it("accepts a plain food name and optional serving amount", () => {
    const parsed = MealItemInputSchema.parse({
      name: "Whole-wheat toast",
      amount: "2 slices",
    });
    expect(parsed.name).toBe("Whole-wheat toast");
    expect(parsed.amount).toBe("2 slices");
  });

  it("trims names and treats a blank amount as absent", () => {
    const parsed = MealItemInputSchema.parse({ name: "  Almond milk  ", amount: "" });
    expect(parsed.name).toBe("Almond milk");
    expect(parsed.amount).toBeUndefined();
  });

  it("rejects empty and oversized names", () => {
    expect(() => MealItemInputSchema.parse({ name: "   " })).toThrow();
    expect(() => MealItemInputSchema.parse({ name: "x".repeat(121) })).toThrow();
  });
});

describe("MealLogInputSchema", () => {
  it("accepts a full meal with items and defaults energyBefore to 2", () => {
    const parsed = MealLogInputSchema.parse({
      date: "2026-09-17",
      mealType: "dinner",
      eatenAt: new Date("2026-09-17T18:30:00Z"),
      notes: "Early dinner before a long walk.",
      items: [{ name: "Grilled salmon" }, { name: "Roasted broccoli", amount: "1 cup" }],
    });
    expect(parsed.energyBefore).toBe(2);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.mealType).toBe("dinner");
  });

  it("rejects malformed dates, unknown meal types, and empty item lists", () => {
    expect(() =>
      MealLogInputSchema.parse({ date: "17-09-2026", mealType: "dinner", items: [{ name: "x" }] })
    ).toThrow();
    expect(() =>
      MealLogInputSchema.parse({ date: "2026-09-17", mealType: "brunch", items: [{ name: "x" }] })
    ).toThrow();
    expect(() =>
      MealLogInputSchema.parse({ date: "2026-09-17", mealType: "dinner", items: [] })
    ).toThrow();
  });

  it("caps item count at 30 and notes at 2000", () => {
    const manyItems = Array.from({ length: 31 }, (_, i) => ({ name: `food-${i}` }));
    expect(() =>
      MealLogInputSchema.parse({ date: "2026-09-17", mealType: "snack", items: manyItems })
    ).toThrow();
    expect(() =>
      MealLogInputSchema.parse({
        date: "2026-09-17",
        mealType: "snack",
        notes: "x".repeat(2001),
        items: [{ name: "apple" }],
      })
    ).toThrow();
  });

  it("rejects out-of-range energyBefore values", () => {
    expect(() =>
      MealLogInputSchema.parse({ date: "2026-09-17", mealType: "lunch", energyBefore: 5, items: [{ name: "x" }] })
    ).toThrow();
  });
});

describe("TriggerFoodInputSchema", () => {
  it("accepts a trigger with severity and optional reaction note", () => {
    const parsed = TriggerFoodInputSchema.parse({
      name: "Dairy",
      severity: 4,
      reactionNote: "Wakes me up with joint pain next morning.",
    });
    expect(parsed.severity).toBe(4);
    expect(parsed.reactionNote).toContain("joint pain");
  });

  it("defaults severity to 3 and trims the name", () => {
    const parsed = TriggerFoodInputSchema.parse({ name: "  Gluten  " });
    expect(parsed.severity).toBe(3);
    expect(parsed.name).toBe("Gluten");
  });

  it("rejects empty names and out-of-range severity", () => {
    expect(() => TriggerFoodInputSchema.parse({ name: "  ", severity: 3 })).toThrow();
    expect(() => TriggerFoodInputSchema.parse({ name: "Sugar", severity: 0 })).toThrow();
    expect(() => TriggerFoodInputSchema.parse({ name: "Sugar", severity: 6 })).toThrow();
  });
});

describe("CycleLogSchema / SymptomLogSchema (regression guard)", () => {
  it("still validates the existing cycle shape", () => {
    const parsed = CycleLogSchema.parse({
      startDate: "2026-09-01T00:00:00.000Z",
      phase: "LUTEAL",
    });
    expect(parsed.phase).toBe("LUTEAL");
  });

  it("still validates the existing symptom shape", () => {
    const parsed = SymptomLogSchema.parse({
      symptom: "Morning stiffness",
      severity: 6,
      category: "PHYSICAL",
      date: "2026-09-17",
    });
    expect(parsed.severity).toBe(6);
  });
});

describe("FogLogInputSchema", () => {
  it("accepts a full fog episode with defaults applied", () => {
    const parsed = FogLogInputSchema.parse({
      intensity: 7,
      triggers: ["LOW_SLEEP", "NOISE"],
      brainDumpText: "Everything is loud and slow today.",
      copingToolUsed: "BREATH",
    });
    expect(parsed.intensity).toBe(7);
    expect(parsed.triggers).toEqual(["LOW_SLEEP", "NOISE"]);
    expect(parsed.copingToolUsed).toBe("BREATH");
  });

  it("defaults intensity to 5, triggers to [] and tool to NONE", () => {
    const parsed = FogLogInputSchema.parse({});
    expect(parsed.intensity).toBe(5);
    expect(parsed.triggers).toEqual([]);
    expect(parsed.copingToolUsed).toBe("NONE");
  });

  it("rejects intensity outside 1-10 and unknown coping tools", () => {
    expect(() => FogLogInputSchema.parse({ intensity: 0 })).toThrow();
    expect(() => FogLogInputSchema.parse({ intensity: 11 })).toThrow();
    expect(() => FogLogInputSchema.parse({ copingToolUsed: "YELL" })).toThrow();
  });

  it("caps triggers at 12 and each label at 40 characters", () => {
    const many = Array.from({ length: 13 }, (_, i) => `trigger-${i}`);
    expect(() => FogLogInputSchema.parse({ triggers: many })).toThrow();
    expect(() =>
      FogLogInputSchema.parse({ triggers: ["x".repeat(41)] })
    ).toThrow();
  });

  it("trims trigger labels and rejects blank entries", () => {
    const parsed = FogLogInputSchema.parse({ triggers: ["  STRESS  "], brainDumpText: "  " });
    expect(parsed.triggers).toEqual(["STRESS"]);
    expect(() => FogLogInputSchema.parse({ triggers: ["   "] })).toThrow();
  });

  it("caps brain-dump text at 4000 characters", () => {
    expect(() =>
      FogLogInputSchema.parse({ brainDumpText: "x".repeat(4001) })
    ).toThrow();
    expect(() => FogLogInputSchema.parse({ brainDumpText: "x".repeat(4000) })).not.toThrow();
  });
});