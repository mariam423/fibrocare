/**
 * Locale threading through the companion orchestrator: "ar" must activate
 * strict output isolation; omitted/unknown locale must keep the legacy
 * English prompt byte-identical (pinned by companion.test.ts).
 */

import { describe, expect, it } from "vitest";
import { assembleCompanionContext } from "./companion";
import type { LongTermMemory } from "./memory";

const fakeSnapshot = {
  latestLog: null,
  currentPain: 6,
  averagePain: 5.5,
  flareCount: 2,
  topSymptoms: ["fatigue"],
  streakDays: 3,
  trend: "stable",
  mentionedMedications: [],
  weather: null,
} as unknown as LongTermMemory;

const deps = {
  buildLongTermMemory: async () => fakeSnapshot,
  retrieve: async () => ({ chunks: [], source: "local" as const }),
};

describe("assembleCompanionContext — locale threading", () => {
  it("activates strict Arabic isolation when locale is 'ar'", async () => {
    const context = await assembleCompanionContext(
      {
        userId: "u",
        userName: "سارة",
        rawMessages: [
          {
            role: "user",
            parts: [
              { type: "text", text: "هل توجد أنماط في سجلاتي هذا الأسبوع؟" },
            ],
          },
        ],
        locale: "ar",
      },
      deps
    );
    expect(context.systemPrompt).toContain("STRICT ARABIC OUTPUT");
    expect(context.systemPrompt).toContain("نوبة اشتعال");
    expect(context.systemPrompt).toContain("HEAT OVER ICE");
  });

  it("keeps the legacy English prompt when locale is omitted or unknown", async () => {
    for (const locale of [undefined, "fr" as string]) {
      const context = await assembleCompanionContext(
        {
          userId: "u",
          userName: "May",
          rawMessages: [{ role: "user", parts: [{ type: "text", text: "hi" }] }],
          ...(locale !== undefined ? { locale: locale as never } : {}),
        },
        deps
      );
      expect(context.systemPrompt).not.toContain("STRICT ARABIC OUTPUT");
      expect(context.systemPrompt).toContain(
        "Respond in the same language the user writes in"
      );
    }
  });
});
