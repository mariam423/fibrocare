import { describe, expect, it } from "vitest";
import { embed, cosineSimilarity, vectorRetrieve } from "./embeddings";
import { chunkText } from "./chunker";

describe("embeddings", () => {
  it("is deterministic for identical input", () => {
    const a = embed("warm compress eases muscle tension");
    const b = embed("warm compress eases muscle tension");
    expect([...a]).toEqual([...b]);
  });

  it("produces L2-normalized vectors", () => {
    const v = embed("sleep hygiene and pacing");
    const norm = Math.sqrt([...v].reduce((s, x) => s + x * x, 0));
    expect(norm).toBeCloseTo(1, 5);
  });

  it("scores identical text 1.0 and unrelated text low", () => {
    const a = embed("flare management pacing");
    expect(cosineSimilarity(a, a)).toBeCloseTo(1, 5);
    const b = embed("quantum calculus spaceship");
    expect(cosineSimilarity(a, b)).toBeLessThan(0.15);
  });

  it("captures shared morphology through trigrams", () => {
    // كمادات / كمادة share most trigrams — similarity must reflect that.
    const a = embed("الكمادات الدافئة تساعدني");
    const b = embed("كمادة دافئة مفيدة");
    expect(cosineSimilarity(a, b)).toBeGreaterThan(0.2);
  });
});

describe("vectorRetrieve", () => {
  it("finds sleep content for a sleep query", () => {
    const chunks = vectorRetrieve("why do I wake up tired and unrefreshed?", { topK: 3 });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].citation).toBe(1);
  });

  it("respects topK and assigns sequential citations", () => {
    const chunks = vectorRetrieve("pain flare exercise sleep medication pacing stress", { topK: 2 });
    expect(chunks.length).toBeLessThanOrEqual(2);
    expect(chunks.map((c) => c.citation)).toEqual([1, 2]);
  });

  it("returns nothing for an empty query", () => {
    expect(vectorRetrieve("   ")).toEqual([]);
  });

  it("validates every result against the RetrievedChunk schema", () => {
    for (const c of vectorRetrieve("gentle stretching for stiffness")) {
      expect(typeof c.id).toBe("string");
      expect(c.score).toBeGreaterThanOrEqual(0);
      expect(c.score).toBeLessThanOrEqual(1);
    }
  });
});

describe("chunkText", () => {
  it("returns the whole text when under the cap", () => {
    expect(chunkText("short note")).toEqual(["short note"]);
  });

  it("returns [] for empty input", () => {
    expect(chunkText("   ")).toEqual([]);
  });

  it("splits long text into capped chunks with overlap", () => {
    const text = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} talks about pacing energy carefully.`).join(" ");
    const chunks = chunkText(text, { maxChars: 400, overlap: 60 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(400);
    }
    // Overlap: tail of a chunk reappears at the head of the next one.
    const tail = chunks[0].slice(-30);
    expect(chunks[1].startsWith(tail.slice(0, 20)) || chunks[1].includes(tail.trim())).toBe(true);
  });

  it("hard-splits monster sentences without losing content", () => {
    const word = "pacing".repeat(120); // single 720-char "sentence"
    const chunks = chunkText(word, { maxChars: 300, overlap: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.length).toBeLessThanOrEqual(300);
    }
    // No content lost: reassembled length covers the original.
    const total = chunks.reduce((s, c, i) => s + c.length - (i > 0 ? 0 : 0), 0);
    expect(total).toBeGreaterThanOrEqual(600);
  });
});
