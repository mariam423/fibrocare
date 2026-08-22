/**
 * Heuristic free-text → structured log parser.
 *
 * The deterministic offline path (and the LLM's fallback): keyword and
 * intensity-word extraction over the transcript. Deliberately conservative —
 * anything it cannot find stays `null`/empty rather than guessed, and its
 * confidence is reported so the UI can prompt the user to review.
 */

import { BODY_LOCATIONS, KNOWN_SYMPTOMS, parsedHealthLogSchema, type ParsedHealthLog } from "./types";

const INTENSITY_WORDS: Array<{ re: RegExp; score: number }> = [
  { re: /\b(unbearable|excruciating|worst|agony|can'?t move|can'?t function)\b/i, score: 10 },
  { re: /\b(badly|severe|really bad|terrible|horrible|awful|intense)\b/i, score: 8 },
  { re: /\b(a lot|strong|pretty bad|quite bad|flaring|flare)\b/i, score: 7 },
  { re: /\b(hurts|pain|painful|aching|sore|throbbing)\b/i, score: 6 },
  { re: /\b(mild|slight|a bit|a little|manageable|ok-ish)\b/i, score: 3 },
  { re: /\b(none|no pain|pain-free|barely)\b/i, score: 1 },
];

const EXPLICIT_SCORE = /\b(?:pain|level|score)\s*(?:is|at|of)?\s*(10|[0-9])\s*(?:\/\s*10)?\b/i;
const N_OF_TEN = /\b(10|[0-9])\s*\/\s*10\b/;

const SLEEP_QUALITY: Array<{ re: RegExp; quality: number }> = [
  { re: /\b(slept (?:really )?(?:badly|terribly|horribly)|didn'?t sleep|barely slept|no sleep|insomnia|couldn'?t sleep)\b/i, quality: 1 },
  { re: /\b(slept poorly|restless night|kept waking|broken sleep|unrefreshed|unrefreshing)\b/i, quality: 2 },
  { re: /\b(slept ok|okay sleep|so-so sleep)\b/i, quality: 3 },
  { re: /\b(slept (?:well|good|great)|good sleep|deep sleep|slept like a baby)\b/i, quality: 5 },
  { re: /\b(slept fine|decent sleep)\b/i, quality: 4 },
];

const MOOD_WORDS: Array<{ re: RegExp; mood: string }> = [
  { re: /\b(exhausted|drained|depleted)\b/i, mood: "exhausted" },
  { re: /\b(anxious|on edge|nervous|panicky)\b/i, mood: "anxious" },
  { re: /\b(sad|down|low|depressed|blue)\b/i, mood: "low" },
  { re: /\b(irritable|annoyed|frustrated|snappy)\b/i, mood: "irritable" },
  { re: /\b(good|great|happy|okay|calm|positive)\b/i, mood: "okay" },
];

const ENERGY_WORDS: Array<{ re: RegExp; energy: number }> = [
  { re: /\b(no energy|zero energy|drained|empty)\b/i, energy: 1 },
  { re: /\b(low energy|tired|fatigued|wiped|exhausted)\b/i, energy: 3 },
  { re: /\b(some energy|okay energy)\b/i, energy: 6 },
  { re: /\b(lots of energy|energetic|full of energy)\b/i, energy: 9 },
];

function extractExplicitScore(text: string): number | null {
  const m = text.match(EXPLICIT_SCORE) ?? text.match(N_OF_TEN);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 10 ? n : null;
}

function extractIntensityScore(text: string): number | null {
  // Longest/most specific patterns are listed first — take the first hit.
  for (const { re, score } of INTENSITY_WORDS) {
    if (re.test(text)) return score;
  }
  return null;
}

/** Parse an unstructured transcript/thought into a structured log draft. */
export function heuristicParseLog(rawText: string): ParsedHealthLog {
  const text = rawText.trim().slice(0, 2000);
  const lower = text.toLowerCase();

  const bodyLocations = BODY_LOCATIONS.filter((loc) =>
    // Match "left shoulder" without double-counting when both appear —
    // specific two-word locations win, and "shoulders" only counts alone.
    lower.includes(loc)
  );
  // Prefer the specific variants: drop "shoulders"/"arms" if a side is named.
  const filteredLocations = bodyLocations.filter(
    (loc) =>
      !(
        (loc === "shoulders" && (lower.includes("left shoulder") || lower.includes("right shoulder"))) ||
        (loc === "arms" && (lower.includes("left arm") || lower.includes("right arm")))
      )
  );

  const symptoms = KNOWN_SYMPTOMS.filter((s) => lower.includes(s));

  const painScore =
    extractExplicitScore(text) ??
    (filteredLocations.length > 0 || symptoms.length > 0
      ? (extractIntensityScore(text) ?? 5)
      : extractIntensityScore(text));

  let sleepQuality: number | null = null;
  for (const { re, quality } of SLEEP_QUALITY) {
    if (re.test(text)) {
      sleepQuality = quality;
      break;
    }
  }

  let mood: string | null = null;
  for (const { re, mood: m } of MOOD_WORDS) {
    if (re.test(text)) {
      mood = m;
      break;
    }
  }

  let energy: number | null = null;
  for (const { re, energy: e } of ENERGY_WORDS) {
    if (re.test(text)) {
      energy = e;
      break;
    }
  }

  const signals = [
    painScore !== null,
    filteredLocations.length > 0,
    sleepQuality !== null,
    symptoms.length > 0,
    mood !== null,
    energy !== null,
  ];
  const confidence = Math.round((signals.filter(Boolean).length / signals.length) * 100) / 100;

  return parsedHealthLogSchema.parse({
    painScore,
    bodyLocations: filteredLocations,
    sleepQuality,
    symptoms,
    mood,
    energy,
    notesClean: text.slice(0, 600),
    confidence,
  });
}
