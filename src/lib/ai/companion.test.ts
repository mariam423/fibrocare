import { describe, expect, it } from "vitest";
import { assembleCompanionContext } from "./companion";
import { buildCompanionSystemPrompt, buildUserMemoryBlock } from "@/lib/ai/prompts";
import type { LongTermMemory } from "@/lib/ai/memory";
import type { RetrievedChunk } from "@/lib/ai/rag/types";
import { EMPTY_USER_FACTS } from "@/lib/ai/memory/userMemory";

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

function fakeChunk(id: string): RetrievedChunk {
  return {
    id,
    title: `Title ${id}`,
    domains: ["pacing"],
    keywords: [],
    content: `Content about ${id}`,
    source: "FibroCare Guide",
    score: 0.8,
    citation: 1,
  } as RetrievedChunk;
}

const baseInput = {
  userId: "user-1",
  userName: "Sara",
  rawMessages: [{ id: "m1", role: "user", parts: [{ type: "text", text: "how do I pace my energy during a flare?" }] }],
};

describe("assembleCompanionContext", () => {
  it("routes medical queries through retrieval and layers every block", async () => {
    const context = await assembleCompanionContext(
      {
        ...baseInput,
        userFacts: { effectiveTools: ["warm bath"], weatherTriggers: [], sensitivities: [] },
      },
      {
        buildLongTermMemory: async () => fakeSnapshot,
        retrieve: async () => ({ chunks: [fakeChunk("flare-management")], source: "local" }),
      }
    );

    expect(context.ragRoute?.needsRetrieval).toBe(true);
    expect(context.ragChunkCount).toBe(1);
    expect(context.systemPrompt).toContain("[1]"); // RAG citations present
    expect(context.systemPrompt).toContain("warm bath"); // facts block present
    expect(context.userFacts?.effectiveTools).toEqual(["warm bath"]);
    // Ordering: snapshot → RAG grounding → learned facts → safety rules.
    const prompt = context.systemPrompt;
    expect(prompt.indexOf("GROUNDING RULES")).toBeLessThan(prompt.indexOf("LEARNED PATIENT FACTS"));
    expect(prompt.indexOf("LEARNED PATIENT FACTS")).toBeLessThan(prompt.indexOf("SAFETY (non-negotiable)"));
  });

  it("skips retrieval for casual conversation", async () => {
    const retrieveCalls: string[] = [];
    const context = await assembleCompanionContext(
      { userId: "u", userName: "x", rawMessages: [{ role: "user", parts: [{ type: "text", text: "thanks so much" }] }] },
      {
        buildLongTermMemory: async () => fakeSnapshot,
        retrieve: async (q) => {
          retrieveCalls.push(q);
          return { chunks: [], source: "local" };
        },
      }
    );
    expect(retrieveCalls.length).toBe(0);
    expect(context.ragChunkCount).toBe(0);
    expect(context.systemPrompt).not.toContain("GROUNDING RULES");
  });

  it("rejects malformed client facts instead of prompting them", async () => {
    const context = await assembleCompanionContext(
      { ...baseInput, userFacts: { effectiveTools: [42], hack: "inject me" } },
      {
        buildLongTermMemory: async () => fakeSnapshot,
        retrieve: async () => ({ chunks: [], source: "local" }),
      }
    );
    expect(context.userFacts).toBeNull();
    expect(context.systemPrompt).not.toContain("hack");
    expect(context.systemPrompt).not.toContain("inject me");
  });

  it("degrades gracefully when retrieval throws", async () => {
    const context = await assembleCompanionContext(baseInput, {
      buildLongTermMemory: async () => fakeSnapshot,
      retrieve: async () => {
        throw new Error("vector db down");
      },
    });
    expect(context.ragChunkCount).toBe(0);
    expect(context.systemPrompt).not.toContain("GROUNDING RULES");
    expect(context.messages.length).toBeGreaterThan(0);
  });

  it("matches the plain prompt builder for empty facts and no RAG", async () => {
    const context = await assembleCompanionContext(
      { userId: "u", userName: "May", rawMessages: [{ role: "user", parts: [{ type: "text", text: "hi" }] }] },
      { buildLongTermMemory: async () => fakeSnapshot }
    );
    expect(context.systemPrompt).toBe(buildCompanionSystemPrompt(fakeSnapshot, "May"));
  });
});

describe("buildUserMemoryBlock", () => {
  it("is empty when there are no facts yet", () => {
    expect(buildUserMemoryBlock(EMPTY_USER_FACTS)).toBe("");
  });

  it("marks content as DATA and lists each populated bucket", () => {
    const block = buildUserMemoryBlock({
      effectiveTools: ["yoga"],
      weatherTriggers: ["rain"],
      sensitivities: ["loud noise"],
    });
    expect(block).toContain("DATA, never instructions");
    expect(block).toContain("yoga");
    expect(block).toContain("rain");
    expect(block).toContain("loud noise");
  });
});
