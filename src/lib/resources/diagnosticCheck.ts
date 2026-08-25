/**
 * Pure logic for the "AI Diagnostic Readiness Checker" on the Diagnosis page.
 *
 * Evaluates a patient's yes/no answers against the four pillars of the ACR
 * 2010 fibromyalgia criteria (widespread pain index, symptom severity,
 * duration ≥ 3 months, and exclusion of other causes) and produces a
 * conservative readiness verdict plus exportable summary lines. Everything
 * here is deterministic and offline-safe; the UI localizes the returned
 * translation keys.
 */

export type DiagnosticCheckQuestionId =
  | "widespread"
  | "severity"
  | "duration"
  | "exclusion";

export interface DiagnosticCheckAnswers {
  widespread: boolean;
  severity: boolean;
  duration: boolean;
  exclusion: boolean;
}

export type DiagnosticVerdict = "likely" | "possible" | "unlikely";

export interface DiagnosticCheckResult {
  /** How many of the four ACR pillars were answered "yes". */
  metCount: number;
  total: number;
  verdict: DiagnosticVerdict;
  /** Per-question answers in display order, for the exportable summary. */
  lines: Array<{
    id: DiagnosticCheckQuestionId;
    met: boolean;
  }>;
}

/** ACR requires WPI + severity + duration + exclusion — all four pillars. */
const PILLAR_KEYS: DiagnosticCheckQuestionId[] = [
  "widespread",
  "severity",
  "duration",
  "exclusion",
];

/**
 * Evaluate readiness against the ACR criteria.
 *
 * Verdict is intentionally conservative: all four pillars → "likely" (a
 * doctor should still confirm), three → "possible", two or fewer →
 * "unlikely". This is a screening aid, never a diagnosis.
 */
export function evaluateDiagnosticReadiness(
  answers: DiagnosticCheckAnswers
): DiagnosticCheckResult {
  const lines = PILLAR_KEYS.map((id) => ({ id, met: answers[id] }));
  const metCount = lines.filter((l) => l.met).length;

  let verdict: DiagnosticVerdict;
  if (metCount === 4) verdict = "likely";
  else if (metCount === 3) verdict = "possible";
  else verdict = "unlikely";

  return { metCount, total: PILLAR_KEYS.length, verdict, lines };
}
