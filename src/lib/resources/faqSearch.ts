/**
 * Semantic FAQ search.
 *
 * Free-text questions (EN or colloquial AR) are tokenized and scored against
 * each FAQ entry: curated keywords count double, matches inside the
 * localized question/answer text count once. English matches use word
 * boundaries so "hip" never hits "shipping"; Arabic uses substring matching
 * (no word boundaries exist in the script). Deterministic and offline-safe.
 */

export interface FaqSearchEntry {
  /** Localized question text. */
  question: string;
  /** Localized answer text. */
  answer: string;
  /** Curated search keywords (EN + AR) — matched with double weight. */
  keywords: string[];
}

/** Small function words that carry no search signal. */
const STOPWORDS = new Set([
  "is",
  "a",
  "an",
  "the",
  "for",
  "with",
  "how",
  "what",
  "when",
  "does",
  "do",
  "can",
  "should",
  "i",
  "my",
  "me",
  "of",
  "to",
  "in",
  "on",
  "and",
  "or",
  "if",
  "it",
  "be",
  "are",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,.;:!?()"'،؟؛-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function textContains(haystack: string, term: string): boolean {
  if (!term) return false;
  if (/[\u0600-\u06FF]/.test(term)) return haystack.toLowerCase().includes(term);
  return new RegExp(`\\b${escapeRegExp(term)}`).test(haystack.toLowerCase());
}

/**
 * Rank FAQ entries for a free-text query. Returns entry indices best-first;
 * every returned index has a positive score. An empty/whitespace query
 * returns all indices in original order (no filtering).
 */
export function searchFaq(query: string, entries: FaqSearchEntry[]): number[] {
  const terms = tokenize(query);
  if (terms.length === 0) return entries.map((_, index) => index);

  const scored = entries.map((entry, index) => {
    const haystack = `${entry.question}\n${entry.answer}`;
    let score = 0;
    for (const term of terms) {
      if (entry.keywords.some((keyword) => textContains(keyword, term))) {
        score += 2;
      } else if (textContains(haystack, term)) {
        score += 1;
      }
    }
    return { index, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.index);
}
