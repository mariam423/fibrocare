import { describe, expect, it } from "vitest";
import { formatLogDate, toIsoKey } from "@/hooks/useDashboard";

describe("toIsoKey", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toIsoKey(new Date(2026, 7, 9))).toBe("2026-08-09");
  });

  it("zero-pads months and days", () => {
    expect(toIsoKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("formatLogDate", () => {
  it("formats a Date into a readable short string without the year", () => {
    const result = formatLogDate(new Date(2026, 7, 9, 14, 30), "en-US");
    expect(result).toMatch(/Aug/i);
    expect(result).toContain("9");
    expect(result).not.toContain("2026");
  });

  it("accepts a string value", () => {
    const result = formatLogDate("2026-08-09T14:30:00.000Z", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
