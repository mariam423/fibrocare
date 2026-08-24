import { describe, expect, it } from "vitest";
import {
  buildMedicalSummary,
  medicalSummarySchema,
  SUMMARY_QUESTION_KEYS,
} from "@/lib/medicalSummary";

function makeInput() {
  const now = Date.now();
  const day = (n: number, painLevel: number) => ({
    painLevel,
    loggedAt: new Date(now - n * 24 * 60 * 60 * 1000),
  });
  return {
    patientName: "Mariam Mahmoud",
    logs: [day(0, 9), day(1, 8), day(2, 7), day(3, 5), day(4, 4), day(5, 3)],
    insights: [
      {
        id: "high-pain-avg",
        title: "Elevated Pain Levels",
        message: "Your average pain is high.",
        severity: "warning" as const,
        params: { avg: 5.5, days: 30 },
      },
      {
        id: "freq-flares",
        title: "Frequent Flare-ups",
        message: "You logged several flare days.",
        severity: "critical" as const,
      },
    ],
    topSymptoms: ["Fatigue", "Headache / Migraine"],
  };
}

describe("buildMedicalSummary localization plumbing", () => {
  it("emits questionRefs aligned 1:1 with recommendedQuestions", () => {
    const summary = buildMedicalSummary(makeInput());
    const refs = summary.questionRefs;
    expect(refs).toBeDefined();
    expect(refs!.length).toBe(summary.recommendedQuestions.length);
    for (const ref of refs!) {
      expect(SUMMARY_QUESTION_KEYS).toContain(ref.key);
    }
  });

  it("carries count/plural params on the flare question ref", () => {
    const summary = buildMedicalSummary(makeInput());
    const flareRef = summary.questionRefs!.find(
      (r) => r.key === "medical.question.flare"
    );
    // 3 of 6 logs are ≥ 7 → flare share 50% → question fires with count 3.
    expect(flareRef).toBeDefined();
    expect(flareRef!.params).toEqual({ count: 3, plural: "s" });

    const singleFlare = buildMedicalSummary({
      ...makeInput(),
      logs: [
        { painLevel: 8, loggedAt: new Date() },
        { painLevel: 2, loggedAt: new Date() },
        { painLevel: 2, loggedAt: new Date() },
        { painLevel: 2, loggedAt: new Date() },
        { painLevel: 2, loggedAt: new Date() },
      ],
    });
    const single = singleFlare.questionRefs!.find(
      (r) => r.key === "medical.question.flare"
    );
    expect(single).toBeDefined();
    expect(single!.params).toEqual({ count: 1, plural: "" });
  });

  it("passes insight ids and params through to keyInsights", () => {
    const summary = buildMedicalSummary(makeInput());
    const first = summary.keyInsights[0];
    expect(first.id).toBe("high-pain-avg");
    expect(first.params).toEqual({ avg: 5.5, days: 30 });
    const second = summary.keyInsights[1];
    expect(second.id).toBe("freq-flares");
    expect(second.params).toBeUndefined();
  });

  it("keeps the legacy English fallback strings byte-identical in the payload", () => {
    const summary = buildMedicalSummary(makeInput());
    expect(summary.recommendedQuestions).toContain(
      "My average pain has been high — are my current medications and doses still the right fit?"
    );
    expect(summary.recommendedQuestions).toContain(
      "What movement or physiotherapy level is safe for me right now without worsening symptoms?"
    );
  });

  it("validates the full enriched payload against the schema", () => {
    const summary = buildMedicalSummary(makeInput());
    const parsed = medicalSummarySchema.safeParse(summary);
    expect(parsed.success).toBe(true);
  });

  it("still accepts legacy payloads without the new optional fields", () => {
    const legacy = {
      generatedAt: new Date().toISOString(),
      periodDays: 30,
      patientName: "Mariam Mahmoud",
      stats: { avgPain: 4, flareUpDays: 1, totalLogs: 6, topSymptoms: [] },
      keyInsights: [
        { severity: "info" as const, title: "T", message: "M" },
      ],
      painTrends: [],
      recommendedQuestions: ["Q?"],
    };
    expect(medicalSummarySchema.safeParse(legacy).success).toBe(true);
  });

  it("always emits at least the movement + tracking questions", () => {
    const empty = buildMedicalSummary({
      patientName: "Mariam Mahmoud",
      logs: [{ painLevel: 1, loggedAt: new Date() }],
      insights: [],
      topSymptoms: [],
    });
    expect(empty.recommendedQuestions.length).toBe(2);
    expect(empty.questionRefs!.map((r) => r.key)).toEqual([
      "medical.question.movement",
      "medical.question.tracking",
    ]);
  });
});
