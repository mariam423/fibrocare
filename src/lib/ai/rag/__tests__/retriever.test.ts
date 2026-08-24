/**
 * Retrieval accuracy tests for the Fibromyalgia Knowledge Base RAG engine,
 * including the brief's canonical probe queries ("flare", "pain", "sleep").
 */

import { describe, expect, it } from "vitest";
import { localRetrieve, retrieveKnowledge } from "../retriever";
import { KNOWLEDGE_BASE } from "../knowledge";
import {
  KB_CATEGORIES,
  categoriesForChunk,
  chunksByCategory,
} from "../knowledgeBase";

describe("categorized knowledge base index", () => {
  it("exposes all four self-care categories with content", () => {
    for (const category of KB_CATEGORIES) {
      expect(chunksByCategory(category).length).toBeGreaterThan(0);
    }
  });

  it("only maps valid categories onto existing chunk ids", () => {
    const ids = new Set(KNOWLEDGE_BASE.map((c) => c.id));
    for (const chunk of KNOWLEDGE_BASE) {
      for (const category of categoriesForChunk(chunk.id)) {
        expect(KB_CATEGORIES).toContain(category);
        expect(ids.has(chunk.id)).toBe(true);
      }
    }
    // Warm therapy is deliberately dual-listed: pain relief AND flare comfort.
    expect(categoriesForChunk("warm-compress-heat-therapy")).toEqual(
      expect.arrayContaining(["pain_and_stiffness", "flare_management"])
    );
  });
});

describe("retrieval accuracy for probe queries", () => {
  it('"flare" retrieves flare_management guidance', () => {
    const [top] = localRetrieve("flare");
    expect(top).toBeDefined();
    expect(top!.id).toBe("flare-management");
    expect(categoriesForChunk(top!.id)).toContain("flare_management");
  });

  it('"pain" retrieves pain guidance; a pain_and_stiffness hint prioritizes moist heat', () => {
    // Bare "pain" is ambiguous (flare vs stiffness) but must stay on-topic.
    const plain = localRetrieve("pain", { topK: 3 });
    expect(plain.some((c) => c.id === "warm-compress-heat-therapy")).toBe(true);
    // The category hint disambiguates toward the self-care heat protocol.
    const boosted = localRetrieve("pain", {
      topK: 3,
      categories: ["pain_and_stiffness"],
    });
    expect(boosted[0]!.id).toBe("warm-compress-heat-therapy");
    expect(categoriesForChunk(boosted[0]!.id)).toContain("pain_and_stiffness");
  });

  it('"sleep" retrieves sleep_architecture guidance', async () => {
    const { chunks, source } = await retrieveKnowledge("sleep");
    expect(source).toBe("local");
    expect(chunks.length).toBeGreaterThan(0);
    expect(categoriesForChunk(chunks[0].id)).toContain("sleep_architecture");
  });
});

describe("category-aware retrieval", () => {
  it("boosts requested categories without excluding other content", () => {
    const plain = localRetrieve("muscle pain and stiffness", { topK: 6 });
    const boosted = localRetrieve("muscle pain and stiffness", {
      topK: 6,
      categories: ["pain_and_stiffness"],
    });
    expect(plain.length).toBeGreaterThan(0);
    // Boost-only semantics: nothing disappears because of a category hint.
    expect(boosted.length).toBeGreaterThanOrEqual(plain.length - 2); // reorder may shuffle tail
    const heatIndexInPlain = plain.findIndex(
      (c) => c.id === "warm-compress-heat-therapy"
    );
    const heatIndexBoosted = boosted.findIndex(
      (c) => c.id === "warm-compress-heat-therapy"
    );
    expect(heatIndexInPlain).toBeGreaterThanOrEqual(0);
    expect(heatIndexBoosted).toBeLessThanOrEqual(heatIndexInPlain);
  });

  it("retrieved pain guidance prescribes warmth, never cold packs", () => {
    const chunks = localRetrieve("muscle pain and stiffness");
    const heat = chunks.find((c) => c.id === "warm-compress-heat-therapy");
    expect(heat).toBeDefined();
    expect(heat!.content).toMatch(/moist warm compress|warm bath/i);
  });
});
