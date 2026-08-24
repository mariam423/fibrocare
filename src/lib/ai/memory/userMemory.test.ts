import { describe, expect, it } from "vitest";
import {
  EMPTY_USER_FACTS,
  extractUserFacts,
  loadUserFacts,
  recordConversationTurn,
  saveUserFacts,
  userFactsSchema,
} from "./userMemory";
import type { StorageLike } from "@/lib/security/crypto";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  };
}

describe("userFactsSchema", () => {
  it("defaults to empty arrays", () => {
    expect(userFactsSchema.parse({})).toEqual(EMPTY_USER_FACTS);
  });
});

describe("extractUserFacts", () => {
  it("learns effective tools in English", () => {
    const facts = extractUserFacts("A warm compress really helps me at night.", EMPTY_USER_FACTS);
    expect(facts.effectiveTools.length).toBeGreaterThan(0);
    expect(facts.effectiveTools.join(" ").toLowerCase()).toContain("warm compress");
  });

  it("learns effective tools in Arabic", () => {
    const facts = extractUserFacts("الكمادات الدافئة تساعدني كثيراً", EMPTY_USER_FACTS);
    expect(facts.effectiveTools.length).toBeGreaterThan(0);
  });

  it("learns weather triggers in English", () => {
    const facts = extractUserFacts("Rainy days make my pain worse", EMPTY_USER_FACTS);
    expect(facts.weatherTriggers.length).toBeGreaterThan(0);
  });

  it("learns sensitivities with capture groups", () => {
    const facts = extractUserFacts("I can't tolerate ibuprofen at all.", EMPTY_USER_FACTS);
    expect(facts.sensitivities.join(" ").toLowerCase()).toContain("ibuprofen");
  });

  it("ignores small talk entirely", () => {
    const facts = extractUserFacts("Thanks so much, you are very kind!", EMPTY_USER_FACTS);
    expect(facts).toEqual(EMPTY_USER_FACTS);
  });

  it("does not duplicate an identical fact (case-insensitive)", () => {
    const facts = extractUserFacts("gentle stretching helps me", EMPTY_USER_FACTS);
    expect(facts.effectiveTools.length).toBe(1);
    // Same fact again (different casing/surroundings) → no change, same ref.
    expect(extractUserFacts("Honestly GENTLE STRETCHING helps me!", facts)).toBe(facts);
  });

  it("returns the same object when nothing new is learned", () => {
    const facts = extractUserFacts("hello there", EMPTY_USER_FACTS);
    expect(facts).toBe(EMPTY_USER_FACTS);
  });
});

describe("encrypted persistence", () => {
  it("round-trips facts through encrypted storage", async () => {
    const storage = memoryStorage();
    await saveUserFacts(
      userFactsSchema.parse({
        effectiveTools: ["warm bath"],
        weatherTriggers: ["humidity"],
      }),
      storage
    );
    const loaded = await loadUserFacts(storage);
    expect(loaded.effectiveTools).toEqual(["warm bath"]);
    expect(loaded.weatherTriggers).toEqual(["humidity"]);
  });

  it("stores ciphertext, not plaintext", async () => {
    const storage = memoryStorage();
    await saveUserFacts(userFactsSchema.parse({ effectiveTools: ["heating pad"] }), storage);
    const raw = [...storage.data.values()].join("\n");
    expect(raw).not.toContain("heating pad");
  });

  it("falls back to defaults on corrupt or missing data", async () => {
    const storage = memoryStorage();
    storage.setItem("fibrocare-user-memory", "not-valid-ciphertext");
    expect(await loadUserFacts(storage)).toEqual(EMPTY_USER_FACTS);
    expect(await loadUserFacts(memoryStorage())).toEqual(EMPTY_USER_FACTS);
  });

  it("recordConversationTurn persists newly learned facts", async () => {
    const storage = memoryStorage();
    const after = await recordConversationTurn("gentle stretching helps me mornings", storage);
    expect(after.effectiveTools.length).toBeGreaterThan(0);
    const reloaded = await loadUserFacts(storage);
    expect(reloaded.effectiveTools.length).toBeGreaterThan(0);
  });

  it("recordConversationTurn skips writes when nothing is learned", async () => {
    const storage = memoryStorage();
    await recordConversationTurn("just saying hi", storage);
    expect(storage.getItem("fibrocare-user-memory")).toBeNull();
  });
});
