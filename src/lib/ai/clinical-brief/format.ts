/**
 * Display-layer formatting for Clinical Brief strings.
 *
 * Purely presentational: the brief engine and PDF export keep their raw
 * output; only on-screen rendering passes through here.
 */

/**
 * Clean stray punctuation artifacts from LLM/analytic phrasing before
 * rendering — e.g. a leading "?" in "?Mean pain 6/10…" or doubled
 * sentence marks — plus collapsed whitespace. Latin and Arabic
 * punctuation are both covered.
 */
export function cleanBriefText(value: string): string {
  return value
    .replace(/^[?!,.:;،؛…]+/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
