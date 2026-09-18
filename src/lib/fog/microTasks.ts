/**
 * Micro-task splitter for the Fog Shield (pure, deterministic).
 *
 * Fibro-fog is worst when a single overwhelming task has no obvious first
 * action. This module greedily distributes a task line into up to three
 * tiny, ordered micro-steps — preferring sentence/clause boundaries, then
 * word chunks for long run-on clauses. It is deliberately *not* an LLM:
 * deterministic output, no network, unit-testable, and privacy-safe (the
 * text never leaves the device unless the user explicitly saves a log).
 *
 * The UI pads the result to exactly three steps when fewer come back, using
 * universal low-cognitive "assist" steps (translated in the component).
 */

export interface MicroStep {
  /** A single tiny, doable action phrased with the lowest possible load. */
  label: string;
}

const MAX_RAW_CHARS = 480;
const MIN_CLAUSE_CHARS = 12;
const LONG_CLAUSE_WORDS = 30;

const SENTENCE_RE = /[.!?؟…](?:\s+|$)/;
const CONJUNCTION_RE = /\s+(?:and|but|then|ثم|و)\s+/gi;

function clean(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_RAW_CHARS);
}

/** Split one line into ordered sentence/clause chunks (raw, unmerged). */
function splitSentences(text: string): string[] {
  const pieces: string[] = [];
  let buffer = "";
  const chars = text.split("");
  for (let i = 0; i < chars.length; i += 1) {
    buffer += chars[i];
    if (SENTENCE_RE.test(chars[i])) {
      pieces.push(buffer);
      buffer = "";
    }
  }
  if (buffer.trim()) pieces.push(buffer);
  return pieces.map((p) => p.trim()).filter(Boolean);
}

/** Merge very short fragments (e.g. "ok.") into the previous clause. */
function mergeShort(pieces: string[]): string[] {
  const merged: string[] = [];
  for (const piece of pieces) {
    if (piece.length < MIN_CLAUSE_CHARS && merged.length > 0) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${piece}`.trim();
    } else {
      merged.push(piece);
    }
  }
  return merged;
}

/** Split a long run-on clause on conjunctions, then commas. */
function expandClause(clause: string): string[] {
  const byConjunction = clause
    .split(CONJUNCTION_RE)
    .map((s) => s.trim())
    .filter(Boolean);
  const buckets: string[] = [];
  for (const part of byConjunction) {
    const halves = part
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    buckets.push(...(halves.length > 1 ? halves : [part]));
  }
  return buckets;
}

/** Split a phrase into `count` roughly equal word chunks. */
function wordChunks(text: string, count: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const n = Math.max(1, Math.min(count, words.length));
  const per = Math.ceil(words.length / n);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += per) {
    chunks.push(words.slice(i, i + per).join(" "));
  }
  return chunks;
}

/**
 * Break `raw` into up to three ordered micro-steps. Returns an empty array
 * for blank input; the caller pads to three assist steps when fewer return.
 */
export function breakdownTask(raw: string): MicroStep[] {
  const text = clean(raw);
  if (!text) return [];

  let clauses = mergeShort(splitSentences(text));

  // Fewer than three pieces: try to open up long run-on clauses.
  if (clauses.length < 3) {
    const expanded: string[] = [];
    for (const clause of clauses) {
      const wordCount = clause.split(/\s+/).filter(Boolean).length;
      if (wordCount >= LONG_CLAUSE_WORDS) {
        expanded.push(...expandClause(clause));
      } else {
        expanded.push(clause);
      }
    }
    clauses = expanded;
  }

  // Still short: split the longest clause into word-thirds.
  if (clauses.length < 3) {
    const longest = clauses.reduce(
      (best, c) => (c.length > best.length ? c : best),
      ""
    );
    if (longest.split(/\s+/).filter(Boolean).length >= 6) {
      const thirds = wordChunks(longest, 3);
      const idx = clauses.indexOf(longest);
      clauses.splice(idx, 1, ...thirds);
    }
  }

  return clauses.slice(0, 3).map((label) => ({ label: label.trim() }));
}