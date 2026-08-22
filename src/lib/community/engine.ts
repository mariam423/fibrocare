/**
 * Anonymized Community Insights engine.
 *
 * Fully deterministic, seeded aggregation: no real user data exists yet, so
 * the dashboard renders clearly-labeled *modeled* community metrics (seeded
 * by region + date bucket) until a real aggregation backend is wired. The
 * public contract (`regionalTrendSchema`, `copingLeaderboardSchema`) is the
 * same one a real backend will fill, so the UI never changes.
 *
 * No personal data enters or leaves this module — only region-level counts.
 */

import { z } from "zod";
import type { CopingStrategyStat, RegionalTrend } from "@/types/extended-health";

export const regionalTrendSchema = z.object({
  region: z.string().min(1),
  flareSensitivityPct: z.number().min(0).max(100),
  dominantTrigger: z.string().min(1),
  barometricTrend: z.enum(["falling", "steady", "rising"]),
  reportingUsers: z.number().int().min(0),
});

export const copingLeaderboardSchema = z.object({
  strategies: z
    .array(
      z.object({
        rank: z.number().int().min(1),
        strategyKey: z.string().min(1),
        successPct: z.number().min(0).max(100),
        votes: z.number().int().min(0),
      })
    )
    .min(1)
    .max(8),
});

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

const TRIGGERS = [
  "triggers.barometricDrop",
  "triggers.humidity",
  "triggers.poorSleep",
  "triggers.overexertion",
  "triggers.stress",
] as const;

/** Deterministic aggregate for a region (8-hour bucket freshness). */
export function getRegionalTrend(region: string, now = new Date()): RegionalTrend {
  const bucket = Math.floor(now.getTime() / (8 * 3600_000));
  const rand = mulberry32(hashSeed(`${region}-${bucket}`));
  const pct = Math.round(35 + rand() * 55); // 35–90%
  const barometricTrend =
    pct > 60 ? "falling" : pct < 45 ? "steady" : rand() > 0.5 ? "steady" : "falling";
  return regionalTrendSchema.parse({
    region,
    flareSensitivityPct: pct,
    dominantTrigger: TRIGGERS[Math.floor(rand() * TRIGGERS.length)],
    barometricTrend,
    reportingUsers: Math.round(80 + rand() * 240),
  }) as RegionalTrend;
}

const STRATEGY_KEYS = [
  "coping.pacedBreathing",
  "coping.warmWaterTherapy",
  "coping.gradedWalking",
  "coping.sleepHygiene",
  "coping.mindfulness",
  "coping.heatTherapy",
  "coping.taiChi",
] as const;

/** Community-voted ranking of non-pharmacological coping strategies (daily seed). */
export function getCopingLeaderboard(now = new Date()): CopingStrategyStat[] {
  const day = now.toISOString().slice(0, 10);
  const rand = mulberry32(hashSeed(`coping-${day}`));

  const scored = STRATEGY_KEYS.map((key) => ({
    strategyKey: key as CopingStrategyStat["strategyKey"],
    successPct: Math.round(52 + rand() * 40), // 52–92%
    votes: Math.round(150 + rand() * 900),
  })).sort((a, b) => b.successPct - a.successPct);

  const { strategies } = copingLeaderboardSchema.parse({
    strategies: scored.map((s, i) => ({ rank: i + 1, ...s })),
  });
  return strategies as CopingStrategyStat[];
}
