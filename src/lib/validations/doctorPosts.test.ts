import { describe, expect, it } from "vitest";
import {
  aiAssistantInputSchema,
  doctorPostInputSchema,
  doctorPostRefineSchema,
} from "./doctorPosts";

const VALID = {
  title: "Managing morning stiffness",
  content: "Gentle stretching and a warm shower before rising can ease morning stiffness.",
};

describe("doctorPostInputSchema", () => {
  it("accepts a valid post and defaults kind to article", () => {
    const parsed = doctorPostInputSchema.parse(VALID);
    expect(parsed.kind).toBe("article");
    expect(parsed.tags).toBe("");
  });

  it("accepts every documented kind", () => {
    for (const kind of ["article", "research", "status"] as const) {
      expect(doctorPostInputSchema.parse({ ...VALID, kind }).kind).toBe(kind);
    }
  });

  it("rejects unknown kinds and short/oversized fields", () => {
    expect(() => doctorPostInputSchema.parse({ ...VALID, kind: "news" })).toThrow();
    expect(() => doctorPostInputSchema.parse({ title: "hi", content: VALID.content })).toThrow();
    expect(() =>
      doctorPostInputSchema.parse({ title: VALID.title, content: "too short here" })
    ).toThrow();
    expect(() =>
      doctorPostInputSchema.parse({ title: VALID.title, content: "x".repeat(10001) })
    ).toThrow();
  });
});

describe("doctorPostRefineSchema (status ceiling)", () => {
  it("allows a long article/research but rejects a status over 1400 chars", () => {
    const long = "x".repeat(1401);
    expect(() =>
      doctorPostRefineSchema.parse({ ...VALID, kind: "article", content: long })
    ).not.toThrow();
    expect(() =>
      doctorPostRefineSchema.parse({ ...VALID, kind: "status", content: long })
    ).toThrow(/1400/);
    // Exactly at the ceiling is allowed.
    expect(() =>
      doctorPostRefineSchema.parse({ ...VALID, kind: "status", content: "x".repeat(1400) })
    ).not.toThrow();
  });
});

describe("aiAssistantInputSchema", () => {
  it("accepts reasonable notes and rejects tiny/oversized ones", () => {
    expect(
      aiAssistantInputSchema.parse({ notes: "Sleep hygiene findings from my clinic." }).notes
    ).toContain("Sleep");
    expect(() => aiAssistantInputSchema.parse({ notes: "short" })).toThrow();
    expect(() => aiAssistantInputSchema.parse({ notes: "y".repeat(5001) })).toThrow();
  });
});
