/**
 * Wearable Mock / Sync Adapter.
 *
 * Real payloads (Apple Health / Google Fit exports) are validated with Zod
 * via `parseWearablePayload`. When no wearable is connected,
 * `simulateWearableSync` produces deterministic, clearly-labeled mock data
 * (seeded by date) so the sleep dashboard is fully explorable offline.
 */

import { wearablePayloadSchema } from "./types";

export type WearablePayload = {
  source: "apple-health" | "google-fit" | "manual" | "mock";
  date: string;
  restingHr: number;
  steps: number;
  hrvMs: number;
  deepSleepPct: number | null;
};

/** Validate an incoming wearable payload (throws ZodError on bad data). */
export function parseWearablePayload(raw: unknown): WearablePayload {
  return wearablePayloadSchema.parse(raw);
}

function hashSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic simulated sync for a date (same inputs → same values). */
export function simulateWearableSync(date: string): WearablePayload {
  const rand = mulberry32(hashSeed(`wearable-${date}`));
  const round = (x: number, d = 0) => Number(x.toFixed(d));
  return {
    source: "mock",
    date,
    restingHr: Math.round(62 + rand() * 14),
    steps: Math.round(1200 + rand() * 4800),
    hrvMs: round(24 + rand() * 22, 1),
    deepSleepPct: round(6 + rand() * 14, 1),
  };
}
