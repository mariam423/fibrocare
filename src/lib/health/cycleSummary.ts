import type { CyclePatternLog } from "@/lib/insightEngine";

/**
 * Derived cycle view for the dashboard CycleStatusWidget.
 *
 * Pure function so the phase/day math is unit-testable in isolation
 * (the same pattern as the insight engine).
 */
export interface CycleSummary {
  phase: "MENSTRUAL" | "FOLLICULAR" | "OVULATORY" | "LUTEAL";
  /** 1-based day within the current cycle, clamped to [1, cycleLength]. */
  currentDay: number;
  /** Average gap between the last two start dates (clamped 20–45), else 28. */
  cycleLength: number;
  /** Days (inclusive) within the cycle where a flare is statistically likely. */
  flareWindow: { start: number; end: number };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_CYCLE_LENGTH = 28;
const MIN_CYCLE_LENGTH = 20;
const MAX_CYCLE_LENGTH = 45;

/** Flare likelihood windows per logged phase, as inclusive day ranges. */
const FLARE_WINDOWS: Record<CycleSummary["phase"], (length: number) => { start: number; end: number }> = {
  MENSTRUAL: () => ({ start: 1, end: 5 }),
  FOLLICULAR: () => ({ start: 6, end: 13 }),
  OVULATORY: () => ({ start: 14, end: 19 }),
  LUTEAL: (length) => ({ start: Math.max(20, length - 7), end: length }),
};

/**
 * Build the widget view from the user's cycles, most recent first
 * (the same ordering `analyzePainPatterns` callers already use).
 * Returns `null` when the user has not logged any cycle.
 */
export function deriveCycleSummary(
  cycles: Pick<CyclePatternLog, "phase" | "startDate" | "endDate">[]
): CycleSummary | null {
  const latest = cycles[0];
  if (!latest) return null;

  // Cycle length: the gap to the previous start date when available,
  // clamped to a physiologically plausible range; otherwise the textbook 28.
  let cycleLength = DEFAULT_CYCLE_LENGTH;
  const previous = cycles[1];
  if (previous) {
    const gap = Math.round(
      (latest.startDate.getTime() - previous.startDate.getTime()) / DAY_MS
    );
    cycleLength = Math.min(MAX_CYCLE_LENGTH, Math.max(MIN_CYCLE_LENGTH, gap));
  }

  const currentDay = Math.min(
    cycleLength,
    Math.max(1, Math.floor((Date.now() - latest.startDate.getTime()) / DAY_MS) + 1)
  );

  return {
    phase: latest.phase,
    currentDay,
    cycleLength,
    flareWindow: FLARE_WINDOWS[latest.phase](cycleLength),
  };
}
