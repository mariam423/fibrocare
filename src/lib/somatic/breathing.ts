/**
 * 4-7-8 breathing pattern engine (pure).
 *
 * Classic pattern: inhale 4s · hold 7s · exhale 8s. Given the time since the
 * cycle began, tells the UI which phase it is in and the remaining seconds —
 * the visualizer only renders, this module computes.
 */

import { z } from "zod";
import type { BreathPhase } from "@/types/extended-health";

export const BREATHING_PATTERNS = {
  "4-7-8": [
    { phase: "inhale", seconds: 4 },
    { phase: "hold", seconds: 7 },
    { phase: "exhale", seconds: 8 },
  ],
  "box": [
    { phase: "inhale", seconds: 4 },
    { phase: "hold", seconds: 4 },
    { phase: "exhale", seconds: 4 },
    { phase: "hold", seconds: 4 },
  ],
} as const;

export type PatternName = keyof typeof BREATHING_PATTERNS;

export const breathStateSchema = z.object({
  pattern: z.enum(["4-7-8", "box"]),
  cycle: z.number().int().min(0),
  phase: z.enum(["inhale", "hold", "exhale"]),
  secondsElapsedInPhase: z.number().min(0),
  secondsRemainingInPhase: z.number().min(0),
  cycleSeconds: z.number().int().min(1),
});

export type BreathState = z.infer<typeof breathStateSchema>;

export function cycleLength(pattern: PatternName): number {
  return BREATHING_PATTERNS[pattern].reduce((s, p) => s + p.seconds, 0);
}

/** Where in the pattern is `elapsedSeconds`? Deterministic and pure. */
export function breathStateAt(
  pattern: PatternName,
  elapsedSeconds: number
): BreathState {
  const total = cycleLength(pattern);
  const t = Math.max(0, elapsedSeconds) % total;
  const cycle = Math.floor(Math.max(0, elapsedSeconds) / total);

  let acc = 0;
  for (const step of BREATHING_PATTERNS[pattern]) {
    if (t < acc + step.seconds) {
      const inPhase = t - acc;
      return breathStateSchema.parse({
        pattern,
        cycle,
        phase: step.phase as BreathPhase,
        secondsElapsedInPhase: Math.round(inPhase * 10) / 10,
        secondsRemainingInPhase: Math.round((step.seconds - inPhase) * 10) / 10,
        cycleSeconds: total,
      });
    }
    acc += step.seconds;
  }
  // Unreachable (t < total), but keep the compiler satisfied.
  return breathStateSchema.parse({
    pattern,
    cycle,
    phase: "inhale",
    secondsElapsedInPhase: 0,
    secondsRemainingInPhase: 0,
    cycleSeconds: total,
  });
}
