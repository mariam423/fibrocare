import { describe, expect, it } from "vitest";
import {
  ARABIC_OUTPUT_DIRECTIVE,
  buildCompanionSystemPrompt,
  type CompanionMemory,
} from "./prompts";

function makeMemory(overrides: Partial<CompanionMemory> = {}): CompanionMemory {
  return {
    currentPain: 10,
    avgPain7d: 6.5,
    avgPain30d: 5.2,
    flareDays30d: 4,
    logCount30d: 22,
    topSymptoms: ["fatigue", "headache"],
    streakDays: 3,
    mood: "Severe Flare",
    lastLogAt: "2026-08-24T10:00:00.000Z",
    trend: "rising",
    ...overrides,
  };
}

describe("buildCompanionSystemPrompt — latest log entry in Layer 1", () => {
  it("embeds the newest log entry with severity, symptoms and note", () => {
    const prompt = buildCompanionSystemPrompt(
      makeMemory({
        latestLog: {
          painLevel: 10,
          moodTag: "Severe Flare",
          severity: "severe",
          loggedAt: "2026-08-24T10:00:00.000Z",
          ageHours: 2,
          noteExcerpt: "Can barely get out of bed today.",
          symptoms: ["brain fog", "headache"],
        },
      }),
      "Sara"
    );

    expect(prompt).toContain(
      "- Latest entry details: 10/10 pain (severe), mood \"Severe Flare\" — logged 2h ago"
    );
    expect(prompt).toContain(
      "- Symptoms logged with the latest entry: brain fog, headache"
    );
    expect(prompt).toContain(
      '- Latest note (patient\'s own words, may be truncated): "Can barely get out of bed today."'
    );
  });

  it("says 'just now' when the entry is less than an hour old", () => {
    const prompt = buildCompanionSystemPrompt(
      makeMemory({
        latestLog: {
          painLevel: 9,
          moodTag: null,
          severity: "severe",
          loggedAt: "2026-08-24T11:30:00.000Z",
          ageHours: 0,
          noteExcerpt: null,
          symptoms: [],
        },
      }),
      "Sara"
    );
    expect(prompt).toContain("- Latest entry details: 9/10 pain (severe) — logged just now");
  });

  it("omits the latest-entry lines entirely when no log exists", () => {
    const prompt = buildCompanionSystemPrompt(makeMemory({ currentPain: null }), "Sara");
    expect(prompt).not.toContain("Latest entry details");
    expect(prompt).not.toContain("Symptoms logged with the latest entry");
    expect(prompt).toContain("USER HEALTH SNAPSHOT");
  });
});

describe("buildCompanionSystemPrompt — locale isolation", () => {
  it("keeps the legacy English path intact by default", () => {
    const prompt = buildCompanionSystemPrompt(makeMemory(), "Sara");
    expect(prompt).toContain("Respond in the same language the user writes in");
    expect(prompt).not.toContain("STRICT ARABIC OUTPUT");
    // Symptom ids stay verbatim in English snapshots.
    expect(prompt).toContain("Top symptoms: fatigue, headache");
  });

  it("embeds the strict Arabic directive and glossary for locale 'ar'", () => {
    const prompt = buildCompanionSystemPrompt(makeMemory(), "سارة", "", "", "ar");
    expect(prompt).toContain(ARABIC_OUTPUT_DIRECTIVE);
    // Glossary pins the canonical Arabic medical/UI terms.
    expect(prompt).toContain("نوبة اشتعال"); // flare
    expect(prompt).toContain("ضباب الفايبرو"); // fibro fog
    expect(prompt).toContain("تسجيلات"); // log entries
    expect(prompt).toContain("أعراض"); // symptoms
    // The mirror-the-user line is replaced, not duplicated.
    expect(prompt).not.toContain("Respond in the same language the user writes in");
    // Warm-therapy safety rule still rides along in every locale.
    expect(prompt).toContain("HEAT OVER ICE");
  });

  it("localizes snapshot symptom labels into Arabic for locale 'ar'", () => {
    const prompt = buildCompanionSystemPrompt(
      makeMemory({
        topSymptoms: ["fatigue", "headache", "custom-ache"],
        latestLog: {
          painLevel: 7,
          moodTag: null,
          severity: "moderate",
          loggedAt: "2026-08-24T10:00:00.000Z",
          ageHours: 3,
          noteExcerpt: null,
          symptoms: ["fibro-fog", "stiffness"],
        },
      }),
      "سارة",
      "",
      "",
      "ar"
    );
    // Known ids map through the shared dictionary; unknown ids humanize.
    expect(prompt).toContain("Top symptoms: إرهاق, صداع / شقيقة, Custom ache");
    expect(prompt).toContain(
      "Symptoms logged with the latest entry: ضباب الألياف, تيبس"
    );
  });
});
