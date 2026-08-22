/**
 * Smart query routing for the RAG pipeline.
 *
 * A deliberately lightweight, deterministic classifier: retrieval is only
 * worth its prompt cost when the query is medical/informational, so casual
 * conversation ("thanks!", "hi", "I'm tired today") skips the knowledge base
 * entirely. No model call — routing must stay free and instant.
 *
 * Signals:
 *  - domain keywords hit → retrieval, with the matched domains boosted later;
 *  - question words / informational verbs → retrieval;
 *  - short greetings, thanks, pure emotional statements → no retrieval.
 */

import { RAG_DOMAINS, ragRouteSchema, type RagDomain, type RagRoute } from "./types";

/** Words that strongly indicate an informational/medical query. */
const QUESTION_WORDS = new Set([
  "what", "why", "how", "when", "should", "can", "is", "are", "does",
  "do", "which", "any", "explain", "tell", "about", "advice", "tip",
  "tips", "help", "idea", "ideas", "suggest", "recommend", "research",
  "study", "studies", "evidence", "guideline", "guidelines", "difference",
]);

/** Short conversational turns that never need retrieval. */
const CHAT_ONLY_PATTERNS = [
  /^(hi|hey|hello|good\s?(morning|afternoon|evening)|salam|مرحبا|اهلا|أهلا)\b/i,
  /^(thanks|thank you|thx|ty|شكرا)\b/i,
  /^(ok|okay|great|nice|cool|alright|تمام|حسنا)\b/i,
  /^(bye|goodbye|good night)\b/i,
];

const DOMAIN_KEYWORDS: Record<RagDomain, string[]> = {
  diagnosis: ["diagnos", "criteria", "symptom", "fibro fog", "fog", "test", "blood"],
  flares: ["flare", "crash", "bad day", "worse", "spike", "trigger", "weather", "humidity", "pressure"],
  exercise: ["exercis", "walk", "stretch", "yoga", "swim", "pool", "tai chi", "movement", "active", "physio"],
  sleep: ["sleep", "insomnia", "nap", "bed", "night", "awake", "unrefresh", "tired", "fatigue", "rest"],
  medications: ["medic", "drug", "pill", "dose", "amitriptyline", "duloxetine", "pregabalin", "lyrica", "cymbalta", "side effect", "ibuprofen", "painkiller"],
  pacing: ["pac", "spoon", "energy", "overdo", "overexert", "boom", "bust", "break", "burnout", "activity"],
  "mental-health": ["anxi", "depress", "stress", "mood", "therapy", "cbt", "mental", "panic", "sad", "overwhelm"],
  complementary: ["meditat", "mindful", "acupuncture", "massage", "breathing", "relax", "complementary", "calming"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Classify a user query: does it need clinical RAG retrieval, and which
 * domains does it plausibly touch?
 */
export function routeQuery(query: string): RagRoute {
  const trimmed = query.trim();
  const tokens = tokenize(trimmed);

  const matchedDomains = new Set<RagDomain>();
  for (const domain of RAG_DOMAINS) {
    for (const kw of DOMAIN_KEYWORDS[domain]) {
      if (trimmed.toLowerCase().includes(kw)) {
        matchedDomains.add(domain);
        break;
      }
    }
  }

  // Crisis language never goes to retrieval — the safety rules in the system
  // prompt take over; retrieving "flare management" amid a crisis is noise.
  if (/\b(self.?harm|suicide|kill myself|end it|kill myself|انتحار|أذي نفسي)\b/i.test(trimmed)) {
    return ragRouteSchema.parse({
      needsRetrieval: false,
      domains: [],
      reason: "crisis language — safety response takes precedence",
    });
  }

  if (matchedDomains.size > 0) {
    return ragRouteSchema.parse({
      needsRetrieval: true,
      domains: [...matchedDomains],
      reason: `domain keywords: ${[...matchedDomains].join(", ")}`,
    });
  }

  if (CHAT_ONLY_PATTERNS.some((p) => p.test(trimmed))) {
    return ragRouteSchema.parse({
      needsRetrieval: false,
      domains: [],
      reason: "short conversational turn",
    });
  }

  const hasQuestionWord = tokens.some((t) => QUESTION_WORDS.has(t));
  if (hasQuestionWord && tokens.length >= 3) {
    return ragRouteSchema.parse({
      needsRetrieval: true,
      domains: [],
      reason: "informational question phrasing",
    });
  }

  return ragRouteSchema.parse({
    needsRetrieval: false,
    domains: [],
    reason: "general conversation — no medical signal",
  });
}
