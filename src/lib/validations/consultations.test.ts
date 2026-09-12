import { describe, expect, it } from "vitest";
import {
  consultationMessageSchema,
  structuredSymptomSchema,
  symptomIntakeSchema,
  symptomSubmissionSchema,
} from "./consultations";

describe("symptomIntakeSchema", () => {
  it("accepts a valid description and defaults persist to false", () => {
    const parsed = symptomIntakeSchema.parse({
      raw: "Aching pain in my lower back for the past week, worse in the morning.",
    });
    expect(parsed.persist).toBe(false);
    expect(parsed.raw).toContain("lower back");
  });

  it("rejects descriptions shorter than 10 characters", () => {
    expect(() => symptomIntakeSchema.parse({ raw: "hurts" })).toThrow();
  });

  it("rejects oversized descriptions", () => {
    const raw = "x".repeat(4001);
    expect(() => symptomIntakeSchema.parse({ raw })).toThrow();
  });

  it("trims surrounding whitespace before length checks", () => {
    const raw = "  Widespread muscle pain and fatigue for three days.  ";
    const parsed = symptomIntakeSchema.parse({ raw });
    expect(parsed.raw.startsWith("Widespread")).toBe(true);
  });
});

describe("structuredSymptomSchema", () => {
  it("accepts a full symptom entry", () => {
    const parsed = structuredSymptomSchema.parse({
      symptom: "Lower back pain",
      severity: 7,
      category: "PHYSICAL",
      area: "LOWER_BACK",
    });
    expect(parsed.severity).toBe(7);
  });

  it("rejects out-of-range severity and unknown categories", () => {
    expect(() =>
      structuredSymptomSchema.parse({ symptom: "pain", severity: 11, category: "PHYSICAL" })
    ).toThrow();
    expect(() =>
      structuredSymptomSchema.parse({ symptom: "pain", severity: 3, category: "CARDIAC" })
    ).toThrow();
  });
});

describe("symptomSubmissionSchema", () => {
  it("defaults symptoms and persist, and allows an optional consultationId", () => {
    const parsed = symptomSubmissionSchema.parse({ message: "Please review" });
    expect(parsed.symptoms).toEqual([]);
    expect(parsed.persist).toBe(false);
    expect(parsed.consultationId).toBeUndefined();
  });

  it("rejects a malformed consultationId", () => {
    expect(() =>
      symptomSubmissionSchema.parse({ consultationId: "not-a-cuid!!", symptoms: [] })
    ).toThrow();
  });

  it("caps the symptom list at 12 entries", () => {
    const symptoms = Array.from({ length: 13 }, (_, i) => ({
      symptom: `symptom-${i}`,
      severity: 5,
      category: "PHYSICAL" as const,
    }));
    expect(() => symptomSubmissionSchema.parse({ symptoms })).toThrow();
  });
});

describe("consultationMessageSchema", () => {
  it("accepts a normal message with a cuid thread id", () => {
    const parsed = consultationMessageSchema.parse({
      consultationId: "cktestcuid000000000000000",
      content: "Good morning doctor, the flare has eased since Monday.",
    });
    expect(parsed.content).toContain("flare");
  });

  it("rejects empty and oversized content", () => {
    const id = "cktestcuid000000000000000";
    expect(() => consultationMessageSchema.parse({ consultationId: id, content: "   " })).toThrow();
    expect(() =>
      consultationMessageSchema.parse({ consultationId: id, content: "y".repeat(5001) })
    ).toThrow();
  });
});
