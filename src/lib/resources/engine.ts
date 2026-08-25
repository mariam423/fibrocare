/**
 * Pure logic for the Care Resources page.
 *
 *  - `resolveSemanticIntent` maps patient-described symptom language (EN and
 *    colloquial AR) to a category + body regions.
 *  - `buildFlareActionPlan` compiles a 3-step immediate-relief protocol from
 *    pain, spoons, and weather — every step names the RAG knowledge chunk it
 *    is grounded in.
 *  - `CARD_SUMMARIES` holds the per-card TL;DR bullets (translation keys) and
 *    the retrieval query used to fetch the cited guideline chunk.
 *
 * Everything here is deterministic and offline-safe; no network, no keys.
 */

import type { TranslationKey } from "@/lib/translations";
import type { WeatherTriggerId } from "@/lib/weather";
import { localRetrieve } from "@/lib/ai/rag/retriever";
import type { RetrievedChunk } from "@/lib/ai/rag/types";

/* ------------------------------------------------------------------ */
/* Categories / effort / body map                                      */
/* ------------------------------------------------------------------ */

export type ResourceCategoryId =
  | "managingFlares"
  | "nutritionHydration"
  | "gentleMovement"
  | "mentalSupport";

export type EffortLevel = "low" | "medium";

export type BodyPartId =
  | "neck"
  | "shoulders"
  | "lowerBack"
  | "hips"
  | "knees"
  | "joints";

export interface BodyPartProfile {
  labelKey: TranslationKey;
  /** Resource categories this region maps to (used for filtering). */
  categories: ResourceCategoryId[];
  /** Resource card ids that address this region. */
  cardIds: string[];
  /** Whether heat therapy is a localized match for this region. */
  heat: boolean;
  /** Whether gentle movement is a localized match for this region. */
  movement: boolean;
}

export const BODY_PARTS: Record<BodyPartId, BodyPartProfile> = {
  neck: {
    labelKey: "resources.bodyMap.part.neck",
    categories: ["gentleMovement", "managingFlares"],
    cardIds: ["move-stretching", "flare-heat", "flare-breathwork"],
    heat: true,
    movement: true,
  },
  shoulders: {
    labelKey: "resources.bodyMap.part.shoulders",
    categories: ["gentleMovement", "managingFlares"],
    cardIds: ["move-stretching", "flare-heat", "flare-breathwork"],
    heat: true,
    movement: true,
  },
  lowerBack: {
    labelKey: "resources.bodyMap.part.lowerBack",
    categories: ["managingFlares", "gentleMovement"],
    cardIds: ["flare-heat", "move-stretching", "flare-pacing"],
    heat: true,
    movement: true,
  },
  hips: {
    labelKey: "resources.bodyMap.part.hips",
    categories: ["gentleMovement"],
    cardIds: ["move-stretching", "move-walking"],
    heat: false,
    movement: true,
  },
  knees: {
    labelKey: "resources.bodyMap.part.knees",
    categories: ["gentleMovement"],
    cardIds: ["move-walking", "move-stretching"],
    heat: false,
    movement: true,
  },
  joints: {
    labelKey: "resources.bodyMap.part.joints",
    categories: ["gentleMovement", "nutritionHydration", "managingFlares"],
    cardIds: ["flare-heat", "nutri-antiinflam", "move-stretching"],
    heat: true,
    movement: true,
  },
};

/* ------------------------------------------------------------------ */
/* Semantic symptom mapping                                            */
/* ------------------------------------------------------------------ */

export interface SemanticIntent {
  /** Best-guess resource category, when one matches. */
  category?: ResourceCategoryId;
  /** Body regions named in the query. */
  bodyParts: BodyPartId[];
  /** The symptom terms that matched (for display / debug). */
  matchedTerms: string[];
}

interface SymptomRule {
  terms: string[];
  category: ResourceCategoryId;
  bodyParts?: BodyPartId[];
}

/**
 * Colloquial symptom vocabulary — checked in order so specific body regions
 * win over generic categories ("stiff neck" → movement, not mental support).
 */
const SYMPTOM_RULES: SymptomRule[] = [
  {
    terms: ["stiff neck", "neck pain", "neck", "رقبتي", "رقبتي بتوجعني", "رقبة"],
    category: "gentleMovement",
    bodyParts: ["neck"],
  },
  {
    terms: ["shoulder", "shoulders", "كتف", "كتفي"],
    category: "gentleMovement",
    bodyParts: ["shoulders"],
  },
  {
    terms: ["lower back", "back pain", "backache", "ظهر", "أسفل الظهر", "ضهري"],
    category: "gentleMovement",
    bodyParts: ["lowerBack"],
  },
  {
    terms: ["hip", "hips", "ورك", "وركي"],
    category: "gentleMovement",
    bodyParts: ["hips"],
  },
  {
    terms: ["knee", "knees", "ركبة", "ركبتي", "ركبتي بتوجعني", "ركبي"],
    category: "gentleMovement",
    bodyParts: ["knees"],
  },
  {
    terms: ["joint", "joints", "مفصل", "مفاصل"],
    category: "gentleMovement",
    bodyParts: ["joints"],
  },
  {
    terms: ["stiff", "stiffness", "stretching", "stretch", "movement", "exercise", "yoga", "walk", "walking", "تيبس", "تمدد", "تمطيط", "مشي", "رياضة"],
    category: "gentleMovement",
  },
  {
    terms: ["can't sleep", "cant sleep", "cannot sleep", "insomnia", "unrefreshed", "sleep", "tired", "exhausted", "fatigue", "نوم", "أرق", "نعاس", "تعب", "إرهاق"],
    category: "mentalSupport",
  },
  {
    terms: ["stress", "stressed", "anxious", "anxiety", "brain fog", "fibro fog", "fog", "concentrat", "memory", "forget", "overwhelm", "توتر", "قلق", "ضباب", "تركيز", "ذاكرة", "نسيان"],
    category: "mentalSupport",
  },
  {
    terms: ["weather", "pressure", "rain", "humidity", "cold", "heat", "season", "طقس", "ضغط", "رطوبة", "مطر", "برد", "حر"],
    category: "managingFlares",
  },
  {
    terms: ["flare", "flaring", "crash", "pain spike", "worse", "bad day", "نوبة", "اشتعال", "انتكاسة", "ألم شديد"],
    category: "managingFlares",
  },
  {
    terms: ["food", "diet", "eat", "eating", "nutrition", "hungry", "omega", "أكل", "طعام", "غذاء", "تغذية", "نظام غذائي"],
    category: "nutritionHydration",
  },
  {
    terms: ["water", "drink", "hydrat", "thirst", "ماء", "شرب", "ترطيب", "عطش"],
    category: "nutritionHydration",
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesTerm(query: string, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return false;
  // Arabic has no word boundaries to rely on — substring match is right.
  if (/[\u0600-\u06FF]/.test(t)) return query.includes(t);
  const words = t.split(/\s+/);
  if (words.length > 1) return query.includes(t);
  // English single words: prefix match at a word boundary so "concentrat"
  // catches "concentration", and "hip" never matches inside "shipping".
  return new RegExp(`\\b${escapeRegExp(t)}`).test(query);
}

/** Map a free-text symptom description to a category + body regions. */
export function resolveSemanticIntent(rawQuery: string): SemanticIntent {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return { bodyParts: [], matchedTerms: [] };

  const bodyParts = new Set<BodyPartId>();
  const matchedTerms: string[] = [];
  let category: ResourceCategoryId | undefined;

  for (const rule of SYMPTOM_RULES) {
    const hit = rule.terms.filter((term) => matchesTerm(query, term));
    if (hit.length === 0) continue;
    matchedTerms.push(hit[0]);
    category ??= rule.category;
    for (const part of rule.bodyParts ?? []) bodyParts.add(part);
  }

  return { category, bodyParts: [...bodyParts], matchedTerms };
}

/* ------------------------------------------------------------------ */
/* AI Flare Action Plan (grounded in RAG chunk ids)                    */
/* ------------------------------------------------------------------ */

export interface FlarePlanStep {
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  /** Knowledge chunk id this step is grounded in (for the citation badge). */
  chunkId: string;
}

export interface FlarePlan {
  steps: FlarePlanStep[];
}

export interface FlarePlanInput {
  painLevel: number;
  spoonsRemaining: number;
  weatherTriggers: WeatherTriggerId[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Compile a 3-step immediate-relief protocol from live state. Steps are
 * drawn from the resource/guidance database and each names its knowledge
 * chunk so the UI can attach a verified citation — never free-form advice.
 */
export function buildFlareActionPlan(input: FlarePlanInput): FlarePlan {
  const pain = clamp(input.painLevel, 0, 10);
  const spoons = clamp(input.spoonsRemaining, 0, 12);
  const triggers = input.weatherTriggers;
  const weatherStressed = triggers.some((t) => t !== "calm");
  const extremeWeather = triggers.includes("heat-extreme") || triggers.includes("cold-extreme");

  // Step 1 — immediate relief, matched to what helps most right now.
  let step1: FlarePlanStep;
  if (spoons <= 2) {
    step1 = { titleKey: "resources.plan.step.rest.title", detailKey: "resources.plan.step.rest.detail", chunkId: "flare-management" };
  } else if (weatherStressed || pain >= 4) {
    step1 = { titleKey: "resources.plan.step.heat.title", detailKey: "resources.plan.step.heat.detail", chunkId: "warm-compress-heat-therapy" };
  } else {
    step1 = { titleKey: "resources.plan.step.breathe.title", detailKey: "resources.plan.step.breathe.detail", chunkId: "breathwork-flares" };
  }

  // Step 2 — protect the rest of the day.
  const step2: FlarePlanStep =
    pain >= 7
      ? { titleKey: "resources.plan.step.environment.title", detailKey: "resources.plan.step.environment.detail", chunkId: "flare-management" }
      : { titleKey: "resources.plan.step.pace.title", detailKey: "resources.plan.step.pace.detail", chunkId: "pacing-spoon-theory" };

  // Step 3 — follow-up: watch-and-care wins for severe/extreme states.
  let step3: FlarePlanStep;
  if (pain >= 9 || extremeWeather) {
    step3 = { titleKey: "resources.plan.step.care.title", detailKey: "resources.plan.step.care.detail", chunkId: "flare-management" };
  } else if (triggers.includes("humidity-high")) {
    step3 = { titleKey: "resources.plan.step.hydrate.title", detailKey: "resources.plan.step.hydrate.detail", chunkId: "hydration-fatigue" };
  } else {
    step3 = { titleKey: "resources.plan.step.resume.title", detailKey: "resources.plan.step.resume.detail", chunkId: "flare-management" };
  }

  return { steps: [step1, step2, step3] };
}

/* ------------------------------------------------------------------ */
/* Per-card TL;DR summaries + citation retrieval queries               */
/* ------------------------------------------------------------------ */

export interface CardSummary {
  bullets: [TranslationKey, TranslationKey, TranslationKey];
  /** Query that retrieves the grounding chunk for this card's summary. */
  query: string;
  /** Expected grounding chunk id (asserted in tests via localRetrieve). */
  chunkId: string;
}

export const CARD_SUMMARIES: Record<string, CardSummary> = {
  "flare-pacing": {
    bullets: [
      "resources.card.flarePacing.summary.1",
      "resources.card.flarePacing.summary.2",
      "resources.card.flarePacing.summary.3",
    ],
    query: "activity pacing energy management spoons boom bust rest breaks",
    chunkId: "pacing-spoon-theory",
  },
  "flare-heat": {
    bullets: [
      "resources.card.flareHeat.summary.1",
      "resources.card.flareHeat.summary.2",
      "resources.card.flareHeat.summary.3",
    ],
    query: "warm compress moist heat muscle tension stiffness",
    chunkId: "warm-compress-heat-therapy",
  },
  "nutri-antiinflam": {
    bullets: [
      "resources.card.antiInflammatory.summary.1",
      "resources.card.antiInflammatory.summary.2",
      "resources.card.antiInflammatory.summary.3",
    ],
    query: "anti-inflammatory diet omega-3 vegetables chronic pain",
    chunkId: "diet-anti-inflammatory",
  },
  "nutri-hydration": {
    bullets: [
      "resources.card.hydration.summary.1",
      "resources.card.hydration.summary.2",
      "resources.card.hydration.summary.3",
    ],
    query: "hydration water fatigue cognitive fog",
    chunkId: "hydration-fatigue",
  },
  "move-stretching": {
    bullets: [
      "resources.card.stretching.summary.1",
      "resources.card.stretching.summary.2",
      "resources.card.stretching.summary.3",
    ],
    query: "gentle stretching flexibility exercise low impact movement",
    chunkId: "exercise-protocols",
  },
  "move-walking": {
    bullets: [
      "resources.card.walking.summary.1",
      "resources.card.walking.summary.2",
      "resources.card.walking.summary.3",
    ],
    query: "graded walking low impact exercise start slow",
    chunkId: "exercise-protocols",
  },
  "mental-mindfulness": {
    bullets: [
      "resources.card.mindfulness.summary.1",
      "resources.card.mindfulness.summary.2",
      "resources.card.mindfulness.summary.3",
    ],
    query: "mindfulness meditation stress reduction relaxation",
    chunkId: "complementary-approaches",
  },
  "mental-sleep": {
    bullets: [
      "resources.card.sleepHygiene.summary.1",
      "resources.card.sleepHygiene.summary.2",
      "resources.card.sleepHygiene.summary.3",
    ],
    query: "sleep hygiene consistent wake time bedtime routine screens caffeine bedroom",
    chunkId: "sleep-hygiene",
  },
  "flare-breathwork": {
    bullets: [
      "resources.card.breathwork.summary.1",
      "resources.card.breathwork.summary.2",
      "resources.card.breathwork.summary.3",
    ],
    query: "slow paced breathing stress response belly",
    chunkId: "breathwork-flares",
  },
  "mental-audio": {
    bullets: [
      "resources.card.audioTherapy.summary.1",
      "resources.card.audioTherapy.summary.2",
      "resources.card.audioTherapy.summary.3",
    ],
    query: "calming music binaural tones relaxation headphones",
    chunkId: "audio-therapy",
  },
};

/** Cards that should surface first when logged pain is high (≥ 7). */
export const LOW_EFFORT_CARD_IDS: readonly string[] = [
  "flare-breathwork",
  "mental-audio",
  "flare-pacing",
  "flare-heat",
  "mental-mindfulness",
];

/* ------------------------------------------------------------------ */
/* AI trigger-food swaps (grounded in the anti-inflammatory diet chunk) */
/* ------------------------------------------------------------------ */

export type TriggerFoodId =
  | "sugar"
  | "caffeine"
  | "alcohol"
  | "processed"
  | "sodas";

export interface FoodSwap {
  /** Localized replacement suggestion. */
  swapKey: TranslationKey;
  /** Localized plain-language reason for the swap. */
  reasonKey: TranslationKey;
  /** Knowledge chunk the swap is grounded in (for the citation badge). */
  chunkId: string;
}

/**
 * Deterministic, verified replacement map — never free-form advice. Every
 * swap is a plain-language, brain-fog-friendly substitute grounded in the
 * anti-inflammatory diet guidance in the local RAG knowledge base.
 */
export const FOOD_SWAPS: Record<TriggerFoodId, FoodSwap> = {
  sugar: {
    swapKey: "nutrition.swap.item.sugar",
    reasonKey: "nutrition.swap.reason.sugar",
    chunkId: "diet-anti-inflammatory",
  },
  caffeine: {
    swapKey: "nutrition.swap.item.caffeine",
    reasonKey: "nutrition.swap.reason.caffeine",
    chunkId: "diet-anti-inflammatory",
  },
  alcohol: {
    swapKey: "nutrition.swap.item.alcohol",
    reasonKey: "nutrition.swap.reason.alcohol",
    chunkId: "diet-anti-inflammatory",
  },
  processed: {
    swapKey: "nutrition.swap.item.processed",
    reasonKey: "nutrition.swap.reason.processed",
    chunkId: "diet-anti-inflammatory",
  },
  sodas: {
    swapKey: "nutrition.swap.item.sodas",
    reasonKey: "nutrition.swap.reason.sodas",
    chunkId: "diet-anti-inflammatory",
  },
};

/** Resolve the AI replacement suggestion for a trigger food. */
export function suggestFoodSwap(triggerId: TriggerFoodId): FoodSwap {
  return FOOD_SWAPS[triggerId];
}

/* ------------------------------------------------------------------ */
/* RAG grounding helpers (zero-hallucination citations)                */
/* ------------------------------------------------------------------ */

/** Retrieval query per knowledge chunk id (used by plans and badges). */
const CHUNK_RETRIEVAL_QUERIES: Record<string, string> = {
  "flare-management": "manage fibromyalgia flare rest demands",
  "warm-compress-heat-therapy": "warm compress moist heat muscle tension stiffness",
  "breathwork-flares": "slow paced breathing stress response belly",
  "pacing-spoon-theory": "activity pacing energy spoons boom bust",
  "hydration-fatigue": "hydration water fatigue cognitive fog",
  "acr-criteria-2010":
    "ACR diagnostic criteria widespread pain index WPI symptom severity scale SSS three months",
  "diagnostic-blood-tests":
    "blood tests CBC complete blood count ESR thyroid vitamin D rheumatoid factor rule out",
  "eular-management-overview":
    "management recommendations exercise cognitive behavioral therapy first line",
  "medication-overview":
    "medications amitriptyline duloxetine pregabalin side effects dose",
  "exercise-protocols":
    "graded aerobic exercise walking swimming low impact start slow",
  "sleep-hygiene":
    "sleep hygiene consistent wake time bedtime routine screens caffeine",
  "complementary-approaches":
    "meditation mindfulness yoga tai chi cognitive behavioral therapy relaxation",
  "diet-anti-inflammatory":
    "anti-inflammatory diet omega-3 vegetables fruit whole grains",
};

/**
 * Retrieve the grounding chunk for a chunk id. Returns null when nothing is
 * retrieved or the top hit is a different chunk — callers then fall back to
 * the safe offline note instead of citing the wrong guideline.
 */
export function groundingChunk(chunkId: string): RetrievedChunk | null {
  const query = CHUNK_RETRIEVAL_QUERIES[chunkId];
  if (!query) return null;
  const [top] = localRetrieve(query, { topK: 1 });
  return top && top.id === chunkId ? top : null;
}

/** Grounding chunk for a card's Quick AI Summary (null → unverified). */
export function groundingChunkForCard(cardId: string): RetrievedChunk | null {
  const summary = CARD_SUMMARIES[cardId];
  if (!summary) return null;
  const [top] = localRetrieve(summary.query, { topK: 1 });
  return top && top.id === summary.chunkId ? top : null;
}

/* ------------------------------------------------------------------ */
/* Detail-page AI takeaway + plain-language content                    */
/* ------------------------------------------------------------------ */

export interface PageTakeaway {
  /** 3 localized bullets for the "AI 1-Minute Takeaway" banner. */
  bullets: [TranslationKey, TranslationKey, TranslationKey];
  /** Query that retrieves the grounding chunk for this page. */
  query: string;
  /** Expected grounding chunk id (asserted in tests via localRetrieve). */
  chunkId: string;
}

/** AI takeaway bullets per detail page, each grounded in a knowledge chunk. */
export const PAGE_TAKEAWAYS: Record<string, PageTakeaway> = {
  about: {
    bullets: [
      "resources.takeaway.about.1",
      "resources.takeaway.about.2",
      "resources.takeaway.about.3",
    ],
    query: "fibromyalgia chronic widespread pain fatigue cognitive symptoms",
    chunkId: "acr-criteria-2010",
  },
  diagnosis: {
    bullets: [
      "resources.takeaway.diagnosis.1",
      "resources.takeaway.diagnosis.2",
      "resources.takeaway.diagnosis.3",
    ],
    query: "ACR criteria widespread pain index symptom severity scale three months diagnosis",
    chunkId: "acr-criteria-2010",
  },
  treatment: {
    bullets: [
      "resources.takeaway.treatment.1",
      "resources.takeaway.treatment.2",
      "resources.takeaway.treatment.3",
    ],
    query: "management recommendations exercise cognitive behavioral therapy first line medications",
    chunkId: "eular-management-overview",
  },
  nutrition: {
    bullets: [
      "resources.takeaway.nutrition.1",
      "resources.takeaway.nutrition.2",
      "resources.takeaway.nutrition.3",
    ],
    query: "anti-inflammatory diet omega-3 vegetables chronic pain hydration",
    chunkId: "diet-anti-inflammatory",
  },
  exercises: {
    bullets: [
      "resources.takeaway.exercises.1",
      "resources.takeaway.exercises.2",
      "resources.takeaway.exercises.3",
    ],
    query: "graded exercise walking swimming warm water start slow listen body",
    chunkId: "exercise-protocols",
  },
  faq: {
    bullets: [
      "resources.takeaway.faq.1",
      "resources.takeaway.faq.2",
      "resources.takeaway.faq.3",
    ],
    query: "management recommendations patient education exercise cognitive behavioral therapy chronic condition",
    chunkId: "eular-management-overview",
  },
  community: {
    bullets: [
      "resources.takeaway.community.1",
      "resources.takeaway.community.2",
      "resources.takeaway.community.3",
    ],
    query: "mindfulness relaxation stress reduction social connection well-being",
    chunkId: "complementary-approaches",
  },
};

/** Grounding chunk for a detail page takeaway (null → unverified). */
export function groundingTakeaway(
  pageId: keyof typeof PAGE_TAKEAWAYS
): RetrievedChunk | null {
  const takeaway = PAGE_TAKEAWAYS[pageId];
  if (!takeaway) return null;
  const [top] = localRetrieve(takeaway.query, { topK: 1 });
  return top && top.id === takeaway.chunkId ? top : null;
}
