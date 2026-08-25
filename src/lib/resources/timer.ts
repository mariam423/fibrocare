/**
 * Pure countdown helpers for the interactive exercise timers.
 *
 * Kept framework-free so the ticking math and display formatting can be unit
 * tested without a DOM — the ExerciseTimer component is a thin layer over
 * these two functions.
 */

/** Format seconds as "m:ss" (e.g. 65 → "1:05", 0 → "0:00"). */
export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

/** Advance the countdown by one tick; never drops below 0. */
export function nextTick(remainingSeconds: number): number {
  return Math.max(0, remainingSeconds - 1);
}
