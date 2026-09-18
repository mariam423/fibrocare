import { describe, expect, it } from "vitest";
import {
  computeWarnings,
  isEveningMeal,
  KNOWN_INFLAMMATORY_TRIGGERS,
  matchKnownTriggers,
  matchPersonalTriggers,
  normalizeFoodName,
  serializeWarnings,
  suggestEatingTiming,
  suggestSwapForKnown,
} from "./triggerEngine";

describe("normalizeFoodName", () => {
  it("lowercases, trims, strips trailing punctuation, and collapses spaces", () => {
    expect(normalizeFoodName("  Whole-Wheat Bread!!  ")).toBe("whole-wheat bread");
    expect(normalizeFoodName("Ice  cream?")).toBe("ice cream");
  });
});

describe("matchPersonalTriggers", () => {
  const triggers = [
    { id: "t1", name: "Milk", severity: 4 },
    { id: "t2", name: "Wheat", severity: 3 },
    { id: "t3", name: "Honeydew", severity: 2 },
  ];

  it("matches in both directions (food contains trigger / trigger contains food)", () => {
    const found = matchPersonalTriggers(
      ["Milk with oats", "Whole-wheat bread", "Honey", "Grilled salmon"],
      triggers
    );
    expect(found).toHaveLength(3);
    const milk = found.find((m) => m.id === "t1");
    const wheat = found.find((m) => m.id === "t2");
    const honeydew = found.find((m) => m.id === "t3");
    expect(milk?.severity).toBe(4);
    expect(milk?.matchedFood).toBe("milk with oats");
    expect(wheat?.matchedFood).toBe("whole-wheat bread");
    // trigger contains food: "Honeydew" ⊇ "honey"
    expect(honeydew?.matchedFood).toBe("honey");
  });

  it("returns no matches for safe foods", () => {
    expect(matchPersonalTriggers(["Grilled salmon", "Broccoli"], triggers)).toEqual([]);
  });

  it("is case-insensitive", () => {
    const found = matchPersonalTriggers(["DAIRY MILK"], [
      { id: "t1", name: "Dairy", severity: 4 },
    ]);
    expect(found).toHaveLength(1);
    expect(found[0].kind).toBe("personal");
  });

  it("does not warn on '-free' qualifier foods", () => {
    const found = matchPersonalTriggers(["Gluten-free bread", "Dairy-free yogurt"], [
      { id: "t1", name: "Gluten", severity: 5 },
      { id: "t2", name: "Dairy", severity: 5 },
    ]);
    expect(found).toEqual([]);
  });
});

describe("matchKnownTriggers", () => {
  it("flags known inflammatory groups with one match per category", () => {
    const found = matchKnownTriggers(["White bread", "Sugary soda", "Coffee", "Salmon"]);
    const ids = found.map((m) => m.id).sort();
    expect(ids).toEqual(["caffeine", "gluten", "sugar"]);
  });

  it("returns empty for whole anti-inflammatory foods", () => {
    expect(matchKnownTriggers(["Grilled salmon", "Broccoli", "Blueberries"])).toEqual([]);
  });

  it("covers the documented trigger groups", () => {
    const expected = ["gluten", "dairy", "sugar", "fried", "processed", "alcohol", "caffeine"];
    const actual = KNOWN_INFLAMMATORY_TRIGGERS.map((t) => t.id).sort();
    expect(actual).toEqual(expected.sort());
  });
});

describe("computeWarnings + serializeWarnings", () => {
  it("combines personal and known matches, personal first", () => {
    const warnings = computeWarnings(["Milk with cereal", "Salad"], [
      { id: "t1", name: "Milk", severity: 5 },
    ]);
    expect(warnings[0].kind).toBe("personal");
    expect(warnings[1].kind).toBe("known");
    const snapshot = serializeWarnings(warnings);
    const parsed = JSON.parse(snapshot) as Array<Record<string, unknown>>;
    expect(parsed[0]).toMatchObject({ kind: "personal", id: "t1", severity: 5 });
  });

  it("stays clean on anti-inflammatory meals even with a personal list", () => {
    const warnings = computeWarnings(
      ["Grilled salmon", "Steamed broccoli", "Blueberries"],
      [{ id: "t1", name: "Milk", severity: 5 }]
    );
    expect(warnings).toEqual([]);
  });
});

describe("suggestSwapForKnown", () => {
  it("returns buildable keys for every known group", () => {
    for (const group of KNOWN_INFLAMMATORY_TRIGGERS) {
      const { swapKey, reasonKey } = suggestSwapForKnown(group.id);
      expect(swapKey).toBe(`diet.swap.${group.id}.swap`);
      expect(reasonKey).toBe(`diet.swap.${group.id}.reason`);
    }
  });
});

describe("suggestEatingTiming", () => {
  it("pushes earlier dinners at very low energy", () => {
    const s = suggestEatingTiming(0);
    expect(s.tone).toBe("veryLow");
    expect(s.suggestedBeforeHour).toBe(19);
  });

  it("offers a normal window at full energy", () => {
    const s = suggestEatingTiming(4);
    expect(s.tone).toBe("full");
    expect(s.suggestedBeforeHour).toBeUndefined();
  });
});

describe("isEveningMeal", () => {
  it("treats 17:00 and later as evening", () => {
    expect(isEveningMeal(16)).toBe(false);
    expect(isEveningMeal(17)).toBe(true);
    expect(isEveningMeal(22)).toBe(true);
  });
});