import { describe, expect, it } from "vitest";
import {
  dueAt,
  hourKey,
  factorAvgSeverity,
  factorFrequency,
  labVerdict,
  latestPerTest,
  COMMON_MEDICATIONS,
  LAB_FIELDS,
  type FlareTriggerEntry,
} from "./trackers";

describe("medication scheduler helpers", () => {
  it("buckets by hour so 09:15 no longer matches an 08:00 dose", () => {
    const at0800 = dueAt(COMMON_MEDICATIONS, "09:15");
    // Duloxetine is 08:00, magnesium 21:00, etc. 09:15 → hour 09 → only
    // as-needed items are excluded, none match hour 09.
    expect(at0800.map((m) => m.id)).not.toContain("duloxetine");
  });

  it("never auto-suggests as-needed items", () => {
    const hits = dueAt(COMMON_MEDICATIONS, "08:00").map((m) => m.id);
    expect(hits).not.toContain("aml-tramadol");
    expect(hits).toContain("duloxetine");
  });

  it("hourKey slices HH:MM", () => {
    expect(hourKey("20:45")).toBe("20");
  });
});

describe("flare trigger analytics", () => {
  const rows: FlareTriggerEntry[] = [
    { id: "a", date: "2026-09-01", severity: 8, factors: ["stress", "poorSleep"], note: "" },
    { id: "b", date: "2026-09-02", severity: 4, factors: ["stress"], note: "" },
    { id: "c", date: "2026-09-03", severity: 0, factors: [], note: "" },
  ];

  it("counts factor frequency", () => {
    expect(factorFrequency(rows, "stress")).toBe(2);
    expect(factorFrequency(rows, "poorSleep")).toBe(1);
    expect(factorFrequency(rows, "dietary")).toBe(0);
  });

  it("averages severity among entries that include the factor", () => {
    expect(factorAvgSeverity(rows, "stress")).toBe(6);
    expect(factorAvgSeverity(rows, "poorSleep")).toBe(8);
    expect(factorAvgSeverity(rows, "dietary")).toBeNull();
  });
});

describe("lab verdict + latest-per-test", () => {
  it("classifies against the informational reference range", () => {
    const tsh = LAB_FIELDS.find((f) => f.id === "tsh")!;
    expect(labVerdict(0.2, tsh)).toBe("low");
    expect(labVerdict(2.5, tsh)).toBe("inRange");
    expect(labVerdict(9.1, tsh)).toBe("high");
  });

  it("keeps only the most recent result per test", () => {
    const rows = [
      { id: "a", testId: "tsh" as const, date: "2026-08-01", value: 1.2, note: "" },
      { id: "b", testId: "tsh" as const, date: "2026-09-10", value: 2.8, note: "newer" },
      { id: "c", testId: "crp" as const, date: "2026-09-10", value: 4.1, note: "" },
    ];
    const latest = latestPerTest(rows);
    expect(latest.get("tsh")?.id).toBe("b");
    expect(latest.get("crp")?.id).toBe("c");
    expect(latest.get("vitaminD")).toBeUndefined();
  });
});