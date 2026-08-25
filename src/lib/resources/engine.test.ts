import { describe, expect, it } from "vitest";
import {
  BODY_PARTS,
  CARD_SUMMARIES,
  FOOD_SWAPS,
  LOW_EFFORT_CARD_IDS,
  PAGE_TAKEAWAYS,
  buildFlareActionPlan,
  groundingChunk,
  groundingTakeaway,
  resolveSemanticIntent,
  suggestFoodSwap,
} from "./engine";
import { localRetrieve } from "@/lib/ai/rag/retriever";
import { KNOWLEDGE_BASE } from "@/lib/ai/rag/knowledge";

const calmWeather = ["calm"] as const;

describe("resolveSemanticIntent", () => {
  it("maps 'stiff neck' to gentle movement + the neck region", () => {
    const intent = resolveSemanticIntent("stiff neck");
    expect(intent.category).toBe("gentleMovement");
    expect(intent.bodyParts).toContain("neck");
  });

  it("maps 'can't sleep' to mental support", () => {
    const intent = resolveSemanticIntent("can't sleep");
    expect(intent.category).toBe("mentalSupport");
  });

  it("maps colloquial Arabic knee pain", () => {
    const intent = resolveSemanticIntent("ركبتي بتوجعني");
    expect(intent.bodyParts).toContain("knees");
    expect(intent.category).toBe("gentleMovement");
  });

  it("maps weather language to managing flares", () => {
    const intent = resolveSemanticIntent("pressure dropping and rain");
    expect(intent.category).toBe("managingFlares");
  });

  it("maps 'brain fog' to mental support", () => {
    const intent = resolveSemanticIntent("brain fog makes work hard");
    expect(intent.category).toBe("mentalSupport");
  });

  it("returns an empty intent for empty input", () => {
    const intent = resolveSemanticIntent("   ");
    expect(intent.bodyParts).toEqual([]);
    expect(intent.category).toBeUndefined();
  });

  it("does not match 'hip' inside unrelated words", () => {
    const intent = resolveSemanticIntent("shipping delays today");
    expect(intent.bodyParts).toEqual([]);
  });
});

describe("buildFlareActionPlan", () => {
  it("always produces exactly 3 steps", () => {
    const plan = buildFlareActionPlan({
      painLevel: 6,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(plan.steps).toHaveLength(3);
  });

  it("leads with rest when spoons are nearly gone", () => {
    const plan = buildFlareActionPlan({
      painLevel: 6,
      spoonsRemaining: 1,
      weatherTriggers: [...calmWeather],
    });
    expect(plan.steps[0].titleKey).toContain(".rest.");
    expect(plan.steps[0].chunkId).toBe("flare-management");
  });

  it("leads with heat when weather is stressed and pain is moderate", () => {
    const plan = buildFlareActionPlan({
      painLevel: 5,
      spoonsRemaining: 6,
      weatherTriggers: ["pressure-drop", "humidity-high"],
    });
    expect(plan.steps[0].titleKey).toContain(".heat.");
    expect(plan.steps[0].chunkId).toBe("warm-compress-heat-therapy");
  });

  it("leads with breathing on a calm, low-pain day", () => {
    const plan = buildFlareActionPlan({
      painLevel: 2,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(plan.steps[0].titleKey).toContain(".breathe.");
  });

  it("adds the care step for severe pain", () => {
    const plan = buildFlareActionPlan({
      painLevel: 9,
      spoonsRemaining: 6,
      weatherTriggers: [...calmWeather],
    });
    expect(plan.steps[2].titleKey).toContain(".care.");
  });

  it("adds the hydration step in high humidity", () => {
    const plan = buildFlareActionPlan({
      painLevel: 5,
      spoonsRemaining: 6,
      weatherTriggers: ["humidity-high"],
    });
    expect(plan.steps[2].titleKey).toContain(".hydrate.");
  });

  it("clamps out-of-range inputs", () => {
    const plan = buildFlareActionPlan({
      painLevel: 99,
      spoonsRemaining: -3,
      weatherTriggers: [...calmWeather],
    });
    expect(plan.steps[0].titleKey).toContain(".rest.");
  });
});

describe("CARD_SUMMARIES grounding (RAG)", () => {
  it("covers every card with 3 localized bullets each", () => {
    for (const summary of Object.values(CARD_SUMMARIES)) {
      expect(summary.bullets).toHaveLength(3);
      for (const bullet of summary.bullets) {
        expect(bullet).toMatch(/^resources\.card\./);
      }
    }
  });

  it("retrieves the expected grounding chunk for every card summary", () => {
    for (const [cardId, summary] of Object.entries(CARD_SUMMARIES)) {
      const [top] = localRetrieve(summary.query, { topK: 1 });
      expect(top, `card ${cardId} should retrieve ${summary.chunkId}`).toBeDefined();
      expect(top!.id, `card ${cardId} grounded in ${summary.chunkId}`).toBe(
        summary.chunkId
      );
    }
  });

  it("falls back gracefully when nothing can be verified", () => {
    expect(localRetrieve("zzz qqq vvv")).toEqual([]);
  });
});

describe("detail-page takeaway grounding (RAG)", () => {
  it("covers all seven resource pages with 3 localized bullets each", () => {
    const expectedPages = [
      "about",
      "diagnosis",
      "treatment",
      "nutrition",
      "exercises",
      "faq",
      "community",
    ];
    for (const [pageId, takeaway] of Object.entries(PAGE_TAKEAWAYS)) {
      expect(takeaway.bullets).toHaveLength(3);
      for (const bullet of takeaway.bullets) {
        expect(bullet).toMatch(/^resources\.takeaway\./);
      }
      expect(expectedPages).toContain(pageId);
    }
    expect(Object.keys(PAGE_TAKEAWAYS).sort()).toEqual(
      [...expectedPages].sort()
    );
  });

  it("retrieves the expected grounding chunk for each takeaway", () => {
    for (const takeaway of Object.values(PAGE_TAKEAWAYS)) {
      const [top] = localRetrieve(takeaway.query, { topK: 1 });
      expect(top).toBeDefined();
      expect(top!.id).toBe(takeaway.chunkId);
    }
  });

  it("returns the grounded chunk for both detail pages", () => {
    expect(groundingTakeaway("about")?.id).toBe("acr-criteria-2010");
    expect(groundingTakeaway("diagnosis")?.id).toBe("acr-criteria-2010");
  });

  it("grounds the ACR criteria and blood-test citations", () => {
    expect(groundingChunk("acr-criteria-2010")?.id).toBe("acr-criteria-2010");
    expect(groundingChunk("diagnostic-blood-tests")?.id).toBe(
      "diagnostic-blood-tests"
    );
  });
});

describe("knowledge base additions", () => {
  it("adds the nutrition, hydration, breathwork, audio, and diagnostic chunks", () => {
    const ids = KNOWLEDGE_BASE.map((c) => c.id);
    for (const expected of [
      "diet-anti-inflammatory",
      "hydration-fatigue",
      "breathwork-flares",
      "audio-therapy",
      "diagnostic-blood-tests",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("keeps new chunks warm-therapy compliant (no cold-pack guidance)", () => {
    for (const chunk of KNOWLEDGE_BASE) {
      if (chunk.id === "warm-compress-heat-therapy") continue;
      expect(chunk.content).not.toMatch(/ice pack|cold pack|ice bath|cold compress/i);
    }
  });
});

describe("AI trigger-food swaps", () => {
  it("covers every trigger with a localized swap + reason", () => {
    const triggers = ["sugar", "caffeine", "alcohol", "processed", "sodas"];
    expect(Object.keys(FOOD_SWAPS).sort()).toEqual([...triggers].sort());
    for (const swap of Object.values(FOOD_SWAPS)) {
      expect(swap.swapKey).toMatch(/^nutrition\.swap\.item\./);
      expect(swap.reasonKey).toMatch(/^nutrition\.swap\.reason\./);
      expect(swap.chunkId).toBe("diet-anti-inflammatory");
    }
  });

  it("returns a grounded replacement for every trigger", () => {
    for (const triggerId of Object.keys(FOOD_SWAPS)) {
      const swap = suggestFoodSwap(triggerId as keyof typeof FOOD_SWAPS);
      expect(swap).toBeDefined();
      // The diet chunk must actually be retrievable so the citation badge
      // renders (zero-hallucination contract).
      expect(groundingChunk(swap.chunkId)?.id).toBe("diet-anti-inflammatory");
    }
  });
});

describe("body map profiles", () => {
  it("provides heat/movement hints and matching cards for every region", () => {
    for (const [partId, profile] of Object.entries(BODY_PARTS)) {
      expect(profile.labelKey).toMatch(/^resources\.bodyMap\.part\./);
      expect(profile.cardIds.length).toBeGreaterThan(0);
      expect(partId).toBeTruthy();
    }
  });

  it("lists low-effort cards for high-pain personalization", () => {
    expect(LOW_EFFORT_CARD_IDS.length).toBeGreaterThanOrEqual(3);
    expect(LOW_EFFORT_CARD_IDS).toContain("flare-pacing");
  });
});
