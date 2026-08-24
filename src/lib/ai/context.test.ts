import { describe, expect, it } from "vitest";
import {
  buildLatestLogContext,
  severityBucket,
  NOTE_EXCERPT_MAX_CHARS,
} from "./context";

describe("severityBucket", () => {
  it("mirrors the Health Logs page buckets", () => {
    expect(severityBucket(0)).toBe("low");
    expect(severityBucket(3)).toBe("low");
    expect(severityBucket(4)).toBe("moderate");
    expect(severityBucket(6)).toBe("moderate");
    expect(severityBucket(7)).toBe("severe");
    expect(severityBucket(10)).toBe("severe");
  });
});

describe("buildLatestLogContext", () => {
  const now = new Date("2026-08-24T12:00:00.000Z");

  it("anchors a 10/10 severe flare with mood, freshness and symptoms", () => {
    const latest = {
      painLevel: 10,
      moodTag: "Severe Flare",
      notes: "Can barely get out of bed today.",
      loggedAt: new Date("2026-08-24T10:00:00.000Z"),
    };
    const ctx = buildLatestLogContext(latest, ["brain fog", "headache"], now);

    expect(ctx).toEqual({
      painLevel: 10,
      moodTag: "Severe Flare",
      severity: "severe",
      loggedAt: "2026-08-24T10:00:00.000Z",
      ageHours: 2,
      noteExcerpt: "Can barely get out of bed today.",
      symptoms: ["brain fog", "headache"],
    });
  });

  it("returns null when there is no log at all", () => {
    expect(buildLatestLogContext(null, [], now)).toBeNull();
  });

  it("reports ageHours just below 1h as 0 (logged just now)", () => {
    const latest = {
      painLevel: 8,
      moodTag: "Flare-up",
      notes: null,
      loggedAt: new Date(now.getTime() - 20 * 60 * 1000),
    };
    const ctx = buildLatestLogContext(latest, [], now);
    expect(ctx?.ageHours).toBe(0);
    expect(ctx?.noteExcerpt).toBeNull();
    expect(ctx?.moodTag).toBe("Flare-up");
  });

  it("truncates long notes to the excerpt budget with an ellipsis", () => {
    const long = "x".repeat(NOTE_EXCERPT_MAX_CHARS + 50);
    const ctx = buildLatestLogContext(
      { painLevel: 5, moodTag: "Low Energy", notes: long, loggedAt: now },
      [],
      now
    );
    expect(ctx?.noteExcerpt).toBe(`${"x".repeat(NOTE_EXCERPT_MAX_CHARS)}…`);
  });

  it("keeps short notes verbatim and drops empty/whitespace-only notes", () => {
    const short = buildLatestLogContext(
      { painLevel: 2, moodTag: "Good Day", notes: "  felt okay  ", loggedAt: now },
      [],
      now
    );
    expect(short?.noteExcerpt).toBe("felt okay");

    const blank = buildLatestLogContext(
      { painLevel: 2, moodTag: "Good Day", notes: "   ", loggedAt: now },
      [],
      now
    );
    expect(blank?.noteExcerpt).toBeNull();
  });

  it("dedupes same-day symptoms and caps the list", () => {
    const symptoms = [
      "fatigue",
      "fatigue",
      "headache",
      "brain fog",
      "nausea",
      "dizziness",
      "stiffness",
      "tingling",
      "numbness",
      "extra",
    ];
    const ctx = buildLatestLogContext(
      { painLevel: 7, moodTag: "Flare-up", notes: null, loggedAt: now },
      symptoms,
      now
    );
    expect(ctx?.symptoms).toHaveLength(8);
    expect(ctx?.symptoms.filter((s) => s === "fatigue")).toHaveLength(1);
  });

  it("treats a blank mood tag as unknown", () => {
    const ctx = buildLatestLogContext(
      { painLevel: 4, moodTag: "", notes: null, loggedAt: now },
      [],
      now
    );
    expect(ctx?.moodTag).toBeNull();
  });
});
