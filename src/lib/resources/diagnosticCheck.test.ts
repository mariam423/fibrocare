import { describe, expect, it } from "vitest";
import { evaluateDiagnosticReadiness } from "./diagnosticCheck";

describe("evaluateDiagnosticReadiness", () => {
  it("returns likely when all four ACR pillars are met", () => {
    const r = evaluateDiagnosticReadiness({
      widespread: true,
      severity: true,
      duration: true,
      exclusion: true,
    });
    expect(r.verdict).toBe("likely");
    expect(r.metCount).toBe(4);
    expect(r.total).toBe(4);
    expect(r.lines.every((l) => l.met)).toBe(true);
  });

  it("returns possible when exactly three pillars are met", () => {
    const r = evaluateDiagnosticReadiness({
      widespread: true,
      severity: true,
      duration: true,
      exclusion: false,
    });
    expect(r.verdict).toBe("possible");
    expect(r.metCount).toBe(3);
  });

  it("returns unlikely when two or fewer pillars are met", () => {
    const r = evaluateDiagnosticReadiness({
      widespread: true,
      severity: false,
      duration: false,
      exclusion: false,
    });
    expect(r.verdict).toBe("unlikely");
    expect(r.metCount).toBe(1);
  });

  it("keeps question order stable for the exportable summary", () => {
    const r = evaluateDiagnosticReadiness({
      widespread: true,
      severity: false,
      duration: true,
      exclusion: false,
    });
    expect(r.lines.map((l) => l.id)).toEqual([
      "widespread",
      "severity",
      "duration",
      "exclusion",
    ]);
    expect(r.lines.map((l) => l.met)).toEqual([true, false, true, false]);
  });
});
