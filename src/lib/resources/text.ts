/**
 * Pure tokenizer for RTL-safe text rendering.
 *
 * `splitBdi` splits a localized string into segments; segments flagged
 * `bdi: true` must be wrapped in a `<bdi>` element so that percentages,
 * ranges, standalone numbers, and Latin medical acronyms keep their own
 * direction when embedded in Arabic (RTL) sentences. In LTR mode `<bdi>` has
 * no visual effect, so the same function is safe for both locales.
 *
 * Kept framework-free and deterministic so the wrapping behavior is unit-
 * testable in isolation from React.
 */

export interface BdiSegment {
  text: string;
  bdi: boolean;
}

/**
 * Matches:
 *  - numbers with optional decimals, ranges ("2-4%", "15-30", "8-10", "2.5"),
 *    and optional trailing percent sign — the whole token is wrapped so the
 *    "%" never detaches from its digits in RTL;
 *  - Latin medical acronyms (WPI, SSS, CBC, ESR, ACR, NHS, IBS, PTSD, CBT,
 *    NSAIDs).
 *
 * The trailing `(?!\d)` replaces a `\b` so a "%" at the end of a token
 * doesn't cause backtracking that drops it (a `\b` after "%" fails because
 * "%" and a following space are both non-word chars).
 */
const BDI_TOKEN =
  /\b\d+(?:[.,]\d+)*(?:[–-]\d+%?)?%?(?!\d)|\b(?:WPI|SSS|CBC|ESR|ACR|NHS|IBS|PTSD|CBT|NSAIDs?)\b/g;

/**
 * Split `text` into plain and `<bdi>`-wrapped segments. The concatenation
 * of all segment texts always equals the original string.
 */
export function splitBdi(text: string): BdiSegment[] {
  const out: BdiSegment[] = [];
  const re = new RegExp(BDI_TOKEN.source, "g");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ text: text.slice(last, m.index), bdi: false });
    }
    out.push({ text: m[0], bdi: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bdi: false });
  return out;
}

/** Convenience: the `<bdi>`-wrapped tokens in `text`, in order. */
export function bdiTokens(text: string): string[] {
  return splitBdi(text)
    .filter((s) => s.bdi)
    .map((s) => s.text);
}
