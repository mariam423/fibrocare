/**
 * Long-term USER FACTS memory ("what we learned about you"), stored
 * client-side and encrypted at rest.
 *
 * Distinct from `@/lib/ai/memory` (the server-side 30-day health snapshot):
 * this layer persists the small, durable facts the patient reveals in
 * conversation — which somatic tools actually help them, which weather they
 * blame, what they cannot tolerate. Facts are:
 *
 *   - extracted deterministically (regex patterns, EN + AR) from their own
 *     chat messages — never invented by a model;
 *   - Zod-validated at every boundary;
 *   - encrypted with AES-GCM before touching localStorage (device key via
 *     `src/lib/security/crypto.ts`) so a storage dump shows ciphertext;
 *   - re-validated server-side before being rendered into any prompt.
 */

import { z } from "zod";
import {
  decryptLocalData,
  encryptLocalData,
  type StorageLike,
} from "@/lib/security/crypto";

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

export const userFactsSchema = z.object({
  /** Self-reported tools/techniques that help ("warm compress helps me"). */
  effectiveTools: z.array(z.string().max(80)).max(8).default([]),
  /** Weather the patient links to worsening symptoms. */
  weatherTriggers: z.array(z.string().max(40)).max(6).default([]),
  /** Things they cannot tolerate: meds, foods, sensory sensitivities. */
  sensitivities: z.array(z.string().max(80)).max(8).default([]),
  /** ISO timestamp of the last merge — informational only. */
  updatedAt: z.string().optional(),
});

export type UserFacts = z.infer<typeof userFactsSchema>;

export const EMPTY_USER_FACTS: UserFacts = userFactsSchema.parse({});

const STORAGE_KEY = "fibrocare-user-memory";

/* ------------------------------------------------------------------ */
/* Deterministic extraction (no model involvement)                     */
/* ------------------------------------------------------------------ */

interface PatternRule {
  match: RegExp;
  bucket: keyof Omit<UserFacts, "updatedAt">;
  /** Which capture group holds the fact (default: the whole match). */
  group?: number;
}

/** Bilingual fact patterns. Order matters only for readability. */
const FACT_RULES: PatternRule[] = [
  // --- effective tools -------------------------------------------------
  { match: /\b(warm compress(?:es)?|heating pad|warm bath|warm shower)\b.*\b(help(?:s)?|works|eases?|relieve[sd]?)\b/i, bucket: "effectiveTools", group: 1 },
  { match: /\b(gentle stretching|stretching|yoga|tai chi|walking|swimming|massage|meditation|deep breathing|breathing exercises?)\b.*\b(help(?:s)?|works|eases?|calms?)\b/i, bucket: "effectiveTools", group: 1 },
  { match: /\b(heat|rest(?:ing)?|a nap|napping)\b\s+(?:really\s+)?\bhelps?\b/i, bucket: "effectiveTools", group: 1 },
  // NOTE: JS \b is ASCII-only and misbehaves around Arabic letters, so the
  // Arabic rules anchor with explicit spaces instead of word boundaries.
  { match: /(?:^|\s)(?:الكمادات الدافئة|كمادة دافئة|الحمام الدافئ|حمام دافئ|الدفء|التمطيط اللطيف|المشي|السباحة|التأمل|تمارين التنفس|الاسترخاء)\s?[^\n.]{0,30}?(?:يساعدني|تساعدني|يساعد|تساعد|يريحني|تخفف)/i, bucket: "effectiveTools" },

  // --- weather triggers -------------------------------------------------
  { match: /\b(rain(?:y|fall)?|humidity|humid|cold weather|heat(?:wave)?|storm(?:s)?|pressure changes?)\b[^\n.]{0,40}\b(worse|flare|spike|pain up|achy|hurts?)\b/i, bucket: "weatherTriggers", group: 1 },
  { match: /\b(?:gets?|feel[s]?|it'?s)\s+worse\s+(?:when|before|during|on)\s+(rainy|humid|cold|hot|stormy)/i, bucket: "weatherTriggers", group: 1 },
  { match: /(?:^|\s)(?:المطر|الرطوبة|البرد|الحرارة|العواصف|تغيرات الضغط الجوي)\s?[^\n.]{0,40}?(?:يزيد|أسوأ|اشتعال|تؤلم)/i, bucket: "weatherTriggers" },

  // --- sensitivities / intolerances -------------------------------------
  { match: /\b(?:can'?t tolerate|cannot tolerate|sensitive to|allergic to|intolerant to)\s+([a-z][a-z\s\-]{1,40})/i, bucket: "sensitivities", group: 1 },
  { match: /\b(ibuprofen|advil|naproxen|aleve|aspirin|tramadol|codeine|gluten|dairy|caffeine|alcohol|bright lights?|loud noise[s]?|strong smells?)\b[^\n.]{0,30}\b(?:make[s]? (?:it|me) worse|upset[s]? my stomach|bother[s]? me|flares? me)\b/i, bucket: "sensitivities", group: 1 },
  { match: /(?:^|\s)لا أتحمل\s+([\u0621-\u064A\u0640\s]{2,40})/i, bucket: "sensitivities", group: 1 },
  { match: /(?:^|\s)حساسية من\s+([\u0621-\u064A\u0640\s]{2,40})/i, bucket: "sensitivities", group: 1 },
];

function normalizeCaptured(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,!?؛،]+$/, "")
    .slice(0, 80);
}

function dedupe(values: readonly string[], cap: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= cap) break;
  }
  return out;
}

/**
 * Pull durable facts out of one user message and merge them into the
 * existing set. Pure + deterministic; caps are enforced by the schema.
 */
export function extractUserFacts(text: string, existing: UserFacts): UserFacts {
  if (!text.trim()) return existing;

  const next: UserFacts = {
    effectiveTools: [...existing.effectiveTools],
    weatherTriggers: [...existing.weatherTriggers],
    sensitivities: [...existing.sensitivities],
  };

  for (const rule of FACT_RULES) {
    const global = new RegExp(rule.match.source, rule.match.flags.includes("g") ? rule.match.flags : rule.match.flags + "g");
    for (const m of text.matchAll(global)) {
      const captured = normalizeCaptured(
        rule.group != null ? (m[rule.group] ?? "") : m[0]
      );
      if (captured.length < 3) continue;
      next[rule.bucket].push(captured);
    }
  }

  const merged = userFactsSchema.parse({
    effectiveTools: dedupe(next.effectiveTools, 8),
    weatherTriggers: dedupe(next.weatherTriggers, 6),
    sensitivities: dedupe(next.sensitivities, 8),
    updatedAt: new Date().toISOString(),
  });

  const unchanged =
    merged.effectiveTools.length === existing.effectiveTools.length &&
    merged.weatherTriggers.length === existing.weatherTriggers.length &&
    merged.sensitivities.length === existing.sensitivities.length;

  return unchanged ? existing : merged;
}

/* ------------------------------------------------------------------ */
/* Encrypted persistence                                               */
/* ------------------------------------------------------------------ */

/** Load facts from encrypted local storage. Defaults on absence/corruption. */
export async function loadUserFacts(
  storage?: StorageLike
): Promise<UserFacts> {
  try {
    const raw = await decryptLocalData<unknown>(STORAGE_KEY, storage);
    const parsed = userFactsSchema.safeParse(raw);
    return parsed.success ? parsed.data : EMPTY_USER_FACTS;
  } catch {
    return EMPTY_USER_FACTS;
  }
}

/** Persist facts encrypted. Fail-soft: storage issues never break the UI. */
export async function saveUserFacts(
  facts: UserFacts,
  storage?: StorageLike
): Promise<void> {
  try {
    await encryptLocalData(STORAGE_KEY, userFactsSchema.parse(facts), storage);
  } catch {
    // Encryption unavailable (no Web Crypto) — skip persistence silently.
  }
}

/**
 * Record one user chat turn: load → extract → merge → save (only when the
 * extraction actually learned something new). Returns the current facts.
 */
export async function recordConversationTurn(
  userText: string,
  storage?: StorageLike
): Promise<UserFacts> {
  const current = await loadUserFacts(storage);
  const updated = extractUserFacts(userText, current);
  if (updated !== current) await saveUserFacts(updated, storage);
  return updated;
}
