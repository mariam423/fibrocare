/**
 * Layer 4 — Medical guardrails (output sanitization).
 *
 * Product rule: for fibromyalgia muscle tension, FibroCare recommends WARM
 * comfort measures — "كمادات دافئة / حمام دافئ" (warm compress / warm bath).
 * Cold packs / ice can worsen muscle tension in chronic widespread pain, so
 * accidental cold-therapy mentions are rewritten, and a warm recommendation
 * is appended whenever muscle tension is discussed without one.
 *
 * Streaming design: `/api/chat` streams UI-message chunks and already-sent
 * text can never be rewritten. Deltas are therefore committed only up to a
 * "safe cut": a position where (a) no rewrite phrase starts within the
 * preceding MAX_PATTERN_LEN characters, and (b) the trailing characters are
 * not the forming prefix of any phrase. Everything released is final; the
 * concatenated client stream always equals the fully-guarded reply.
 */

/** Longest rewrite phrase length (bounds the hold-back window). */
export const MAX_PATTERN_LEN = 24;

/* ------------------------------------------------------------------ */
/* Literal rewrite table (longest-match wins, case-insensitive EN)     */
/* ------------------------------------------------------------------ */

const LITERAL_REWRITES: Array<[source: string, replacement: string]> = [
  // Article-aware variants keep grammar intact ("an ice pack" -> "a ...").
  ["an ice pack", "a warm compress"],
  ["an cold pack", "a warm compress"],
  ["an ice bath", "a warm bath"],
  ["an ice compress", "a warm compress"],
  ["an cold compress", "a warm compress"],
  ["cold compresses", "warm compress"],
  ["ice compresses", "warm compress"],
  ["icing the muscles", "warming the muscles"],
  ["icing the pain", "warming the area"],
  ["icing the area", "warming the area"],
  ["cold showers", "warm showers"],
  ["cold compress", "warm compress"],
  ["ice compress", "warm compress"],
  ["cold shower", "warm shower"],
  ["applying ice", "applying warmth"],
  ["applying an ice", "applying warmth"],
  ["using an ice", "using warmth"],
  ["using ice", "using warmth"],
  ["cold baths", "warm baths"],
  ["ice baths", "warm baths"],
  ["cold packs", "warm compress"],
  ["ice packs", "warm compress"],
  ["ice therapy", "heat therapy"],
  ["cold pack", "warm compress"],
  ["ice pack", "warm compress"],
  ["cold bath", "warm bath"],
  ["ice bath", "warm bath"],
  ["كمادة باردة", "كمادة دافئة"],
  ["كمادات باردة", "كمادات دافئة"],
  ["كمادة ثلجية", "كمادة دافئة"],
  ["استخدم ثلج", "استخدم كمادة دافئة"],
  ["ضع ثلج", "ضع كمادة دافئة"],
  ["حمام مثلج", "حمام دافئ"],
  ["حمام بارد", "حمام دافئ"],
  ["ماء مثلج", "ماء دافئ"],
  ["ماء بارد", "ماء دافئ"],
  ["دش مثلج", "دش دافئ"],
  ["دش بارد", "دش دافئ"],
];

/** Sorted longest-first so "cold compresses" wins over "cold compress". */
const SORTED_LITERALS = [...LITERAL_REWRITES].sort(
  (a, b) => b[0].length - a[0].length
);

/* ------------------------------------------------------------------ */
/* Arabic leak table (locale === "ar" streams only)                    */
/* ------------------------------------------------------------------ */

/**
 * Live Arabic traffic showed isolated foreign words slipping into fluent
 * Arabic prose ("logged", "streak", "mood", Spanish "aumento"/"además",
 * French "malgré", route paths like "/zen"). Prompt isolation reduces but
 * cannot guarantee zero slips on every provider tier, so Arabic-mode
 * streams additionally run this bounded lexical repair: curated whole-term
 * swaps, applied only when the surrounding characters are NOT Latin
 * letters/digits (so "moods" is matched by its own entry, never butchered
 * inside a longer word). English replies never touch this table.
 */
const ARABIC_LEAK_REWRITES: Array<[source: string, replacement: string]> = [
  ["/zen", "صفحة التهدئة وتمارين التنفس"],
  ["/reports", "صفحة التقارير"],
  ["/dashboard", "لوحة التحكم"],
  ["logging streak", "سلسلة التسجيل اليومي"],
  ["calming mode", "وضع التهدئة"],
  ["warm compress", "كمادة دافئة"],
  ["warm bath", "حمام دافئ"],
  ["log entries", "تسجيلات"],
  ["fibro fog", "ضباب الفايبرو"],
  ["additionally", "بالإضافة إلى ذلك"],
  ["moreover", "علاوة على ذلك"],
  ["flare-up", "نوبة اشتعال"],
  ["flare up", "نوبة اشتعال"],
  ["dashboard", "لوحة التحكم"],
  ["symptoms", "أعراض"],
  ["logging", "التسجيل"],
  ["logged", "سُجِّل"],
  ["therefore", "لذلك"],
  ["regarding", "بخصوص"],
  ["alongside", "إلى جانب"],
  ["however", "لكن"],
  ["despite", "رغم"],
  ["entries", "تسجيلات"],
  ["entry", "تسجيل"],
  ["average", "المتوسط"],
  ["flares", "نوبات"],
  ["levels", "مستويات"],
  ["streak", "سلسلة التسجيل"],
  ["trends", "الاتجاهات"],
  ["moods", "الحالات المزاجية"],
  ["además", "أيضًا"],
  ["malgré", "رغم ذلك"],
  ["souvent", "غالبًا"],
  ["élevé", "مرتفع"],
  ["aumento", "ارتفاع"],
  ["entradas", "تسجيلات"],
  ["symptom", "عَرَض"],
  ["trend", "الاتجاه"],
  ["flare", "نوبة"],
  ["level", "مستوى"],
  ["mood", "المزاج"],
  ["logs", "تسجيلات"],
  ["also", "أيضًا"],
];

const SORTED_AR_LEAKS = [...ARABIC_LEAK_REWRITES].sort(
  (a, b) => b[0].length - a[0].length
);

/** True when `char` continues a Latin word (blocks intra-word matches). */
function isLatinWordChar(char: string | undefined): boolean {
  return char !== undefined && /[A-Za-z0-9]/.test(char);
}

type RewritePair = readonly [source: string, replacement: string];

/**
 * Whole-text lexical repair over one table. When `precedingChar` carries
 * the character emitted just before `text` in the same stream, matches at
 * index 0 are still boundary-checked against it.
 */
function rewriteWithTable(
  text: string,
  table: ReadonlyArray<RewritePair>,
  precedingChar = ""
): string {
  const lower = text.toLowerCase();
  let out = "";
  let cursor = 0;
  while (cursor < text.length) {
    let matched = false;
    for (const [source, replacement] of table) {
      const src = source.toLowerCase();
      if (!lower.startsWith(src, cursor)) continue;
      const prev =
        cursor === 0 ? precedingChar : text[cursor - 1];
      const next = text[cursor + src.length];
      if (isLatinWordChar(prev) || isLatinWordChar(next)) continue;
      out += replacement;
      cursor += src.length;
      matched = true;
      break;
    }
    if (!matched) {
      out += text[cursor];
      cursor += 1;
    }
  }
  return out;
}

/**
 * Rewrite accidental cold-therapy advice into approved warm-comfort words.
 * Pure function; idempotent on already-compliant text.
 */
export function sanitizeWarmTherapy(text: string): string {
  const lower = text.toLowerCase();
  let out = "";
  let cursor = 0;
  while (cursor < text.length) {
    let matched = false;
    for (const [source, replacement] of SORTED_LITERALS) {
      if (lower.startsWith(source.toLowerCase(), cursor)) {
        out += replacement;
        cursor += source.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += text[cursor];
      cursor += 1;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Warm-recommendation rule                                            */
/* ------------------------------------------------------------------ */

/** Muscle-tension mention (either language) that warrants a warm measure. */
const TENSION_HINT =
  /muscle\s+tension|\btension\b|tense\s+muscles?|\btense\b|muscle\s+stiffness|\bstiff\w*\b|\bstiffness\b|توتر\s+العضلات|شد\s+العضلات|تيبس/i;

/** Warm-comfort mention that satisfies the rule (either language). */
const WARM_MENTION =
  /warm\s+(compress|bath|shower|water|heat)|heating pad|heat therapy|warmth|كمادات?\s+دافئة?|كمادة\s+دافئة|الحمام\s+الدافئ|حمام\s+دافئ|دش\s+دافئ/i;

export const EN_WARM_APPEND =
  " For easing that muscle tension specifically, a warm compress or a warm bath tends to help most — gentle heat relaxes tight muscles.";

export const AR_WARM_APPEND =
  " ولتهدئة توتر العضلات تحديدًا، فإن الكمادات الدافئة أو الحمام الدافئ من أكثر الوسائل راحةً — فالدفء يرخي العضلات المشدودة بلطف.";

/**
 * Full pass over complete text: rewrite cold-therapy mentions, then ensure
 * a warm-compress / warm-bath line exists when tension is discussed. The
 * appended sentence matches the reply language.
 */
export function enforceWarmTherapyGuardrail(text: string): string {
  const sanitized = sanitizeWarmTherapy(text);
  if (!TENSION_HINT.test(sanitized) || WARM_MENTION.test(sanitized)) return sanitized;
  const isArabic = /[\u0600-\u06FF]/.test(sanitized);
  return sanitized + (isArabic ? AR_WARM_APPEND : EN_WARM_APPEND);
}

/* ------------------------------------------------------------------ */
/* Streaming-safe incremental sanitizer                                */
/* ------------------------------------------------------------------ */

/** Public pure helper (unit-tested directly). */
export function sanitizeArabicLeaks(
  text: string,
  precedingChar = ""
): string {
  return rewriteWithTable(text, SORTED_AR_LEAKS, precedingChar);
}

/**
 * Scripts that can never legitimately appear in a FibroCare reply
 * (Arabic UI copy, English medical terms, Latin-transliterated brand
 * names are the only non-Arabic content ever expected). Unlike Latin
 * words — which include patient-reported medication names that MUST
 * survive — removing these carries zero medical risk, so Arabic-mode
 * streams drop them wholesale instead of chasing per-word tables.
 */
const FOREIGN_SCRIPT_RUNS =
  /[\u0400-\u04FF\u0500-\u052F]+|[\u0590-\u05FF]+|[\u3040-\u30FF]+|[\u3400-\u4DBF\u4E00-\u9FFF]+|[\uAC00-\uD7AF\u1100-\u11FF]+/g;

/** Remove impossible scripts and tidy orphan whitespace left behind. */
export function stripForeignScripts(text: string): string {
  return text.replace(FOREIGN_SCRIPT_RUNS, "").replace(/ {2,}/g, " ");
}

/** Cold/warm table + (optionally) the Arabic leak table, longest-first. */
function tableFor(arabicLeaks: boolean): ReadonlyArray<RewritePair> {
  return arabicLeaks
    ? [...SORTED_LITERALS, ...SORTED_AR_LEAKS].sort(
        (a, b) => b[0].length - a[0].length
      )
    : SORTED_LITERALS;
}

/** True when any rewrite phrase starts exactly at `index` in `lower`. */
function literalStartsAt(
  lower: string,
  index: number,
  table: ReadonlyArray<RewritePair>
): boolean {
  for (const [source] of table) {
    if (lower.startsWith(source.toLowerCase(), index)) return true;
  }
  return false;
}

/** True when a suffix of `lower` is a proper prefix of some phrase. */
function endsWithFormingPrefix(
  lower: string,
  table: ReadonlyArray<RewritePair>
): boolean {
  const window = lower.slice(-Math.max(MAX_PATTERN_LEN - 1, 1));
  for (const [source] of table) {
    const src = source.toLowerCase();
    for (let k = 1; k < src.length && k <= window.length; k++) {
      if (window.endsWith(src.slice(0, k))) return true;
    }
  }
  return false;
}

/**
 * Incremental sanitizer for streamed deltas.
 *
 * `push(delta)` returns text that is final and safe to emit (often "").
 * `flush()` releases the held-back remainder and applies the one-shot
 * warm-recommendation append against the whole reply. Invariant:
 *   push(d1)+push(d2)+…+flush() === enforceWarmTherapyGuardrail(fullText)
 */
export class IncrementalGuardrail {
  private pending = "";
  private releasedRaw = "";
  private lastChar = "";
  private readonly table: ReadonlyArray<RewritePair>;
  private readonly arabicLeaks: boolean;

  constructor(options: { arabicLeaks?: boolean } = {}) {
    this.arabicLeaks = options.arabicLeaks ?? false;
    this.table = tableFor(this.arabicLeaks);
  }

  /** Sanitize a released segment with left-context awareness. */
  private repair(chunk: string): string {
    let out: string;
    if (this.arabicLeaks) {
      out = stripForeignScripts(
        rewriteWithTable(chunk, this.table, this.lastChar)
      );
    } else {
      out = sanitizeWarmTherapy(chunk);
    }
    this.lastChar = chunk[chunk.length - 1] ?? this.lastChar;
    return out;
  }

  /** Push a raw delta; receive final text to emit now (may be ""). */
  push(delta: string): string {
    this.pending += delta;
    const lower = this.pending.toLowerCase();
    // Latest safe commit point: far enough from the tail that nothing can
    // straddle, with no phrase starting in the look-back window and no
    // half-formed phrase touching the cut.
    let cut = this.pending.length - MAX_PATTERN_LEN;
    while (cut > 0) {
      const lookBackStart = Math.max(0, cut - MAX_PATTERN_LEN);
      let unsafe = endsWithFormingPrefix(lower.slice(0, cut), this.table);
      for (let i = lookBackStart; i < cut && !unsafe; i++) {
        if (literalStartsAt(lower, i, this.table)) unsafe = true;
      }
      if (!unsafe) break;
      cut--;
    }
    if (cut <= 0) return "";
    const chunk = this.pending.slice(0, cut);
    const released = this.repair(chunk);
    this.releasedRaw += chunk;
    this.pending = this.pending.slice(cut);
    return released;
  }

  /** Release the current text block without applying the final append rule. */
  flushPending(): string {
    if (!this.pending) return "";
    const pending = this.pending;
    const out = this.repair(pending);
    this.releasedRaw += pending;
    this.pending = "";
    return out;
  }

  /** Stream ended: release everything and apply the append rule once. */
  flush(): string {
    const pendingSanitized = this.flushPending();
    const fullSanitized = sanitizeWarmTherapy(
      this.arabicLeaks
        ? rewriteWithTable(this.releasedRaw, SORTED_LITERALS)
        : this.releasedRaw
    );
    let out = pendingSanitized;
    if (TENSION_HINT.test(fullSanitized) && !WARM_MENTION.test(fullSanitized)) {
      const isArabic = /[\u0600-\u06FF]/.test(fullSanitized);
      out += isArabic ? AR_WARM_APPEND : EN_WARM_APPEND;
    }
    this.pending = "";
    this.releasedRaw = "";
    this.lastChar = "";
    return out;
  }
}

/**
 * Byte-level SSE transform for the UI-message stream. Rewrites the `delta`
 * of every `text-delta` event through an IncrementalGuardrail; all other
 * frames pass through untouched. The mandated warm-comfort append is
 * injected as a final delta of the SAME text part, just before its
 * `text-end` frame, so clients always receive well-formed protocol.
 */
export function createGuardrailStreamTransform(
  options: { arabicLeaks?: boolean } = {}
): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let lineBuffer = "";
  let openTextId: string | null = null;
  let pendingTextEnd: { id: string; line: string } | null = null;
  let pendingFrames: string[] = [];
  let finalized = false;
  const guardrail = new IncrementalGuardrail(options);

  const deltaFrame = (id: string, delta: string): string =>
    `data: ${JSON.stringify({ type: "text-delta", id, delta })}\n`;

  /** Finish the response and inject any final safety text into its last part. */
  const finalize = (): string[] => {
    if (finalized) return [];
    finalized = true;
    const tail = guardrail.flush();
    const frames: string[] = [];

    if (pendingTextEnd) {
      if (tail) frames.push(deltaFrame(pendingTextEnd.id, tail));
      // The embedded newline closes this held SSE event; the outer transform
      // adds the second newline required by SSE.
      frames.push(pendingTextEnd.line, ...pendingFrames);
      pendingTextEnd = null;
    } else if (tail && openTextId) {
      // Degenerate stream: the active text part never sent text-end.
      frames.push(deltaFrame(openTextId, tail));
    }

    return frames;
  };

  const processLine = (line: string): string[] => {
    if (!line.startsWith("data:")) {
      if (pendingTextEnd) pendingFrames.push(line);
      return pendingTextEnd ? [] : [line];
    }
    const payload = line.slice(5).trim();
    if (!payload) {
      if (pendingTextEnd) pendingFrames.push(line);
      return pendingTextEnd ? [] : [line];
    }
    let event: { type?: string; id?: string; delta?: string };
    try {
      event = JSON.parse(payload);
    } catch {
      if (pendingTextEnd) pendingFrames.push(line);
      return pendingTextEnd ? [] : [line]; // never break the stream on a malformed frame
    }
    if (event.type === "text-start" && typeof event.id === "string") {
      const frames: string[] = [];
      if (pendingTextEnd) {
        frames.push(pendingTextEnd.line, ...pendingFrames);
        pendingTextEnd = null;
        pendingFrames = [];
      }
      openTextId = event.id;
      return [...frames, line];
    }
    if (event.type === "text-delta" && typeof event.delta === "string") {
      const released = guardrail.push(event.delta);
      return released
        ? [`data: ${JSON.stringify({ ...event, delta: released })}`]
        : [];
    }
    if (event.type === "text-end" && typeof event.id === "string") {
      const released = guardrail.flushPending();
      const frames: string[] = [];
      if (released) frames.push(deltaFrame(event.id, released));
      // Hold the end marker until we know whether another text part follows.
      // This keeps the final safety append inside the last text part.
      pendingTextEnd = { id: event.id, line };
      pendingFrames = [];
      openTextId = null;
      return frames;
    }
    if (
      (event.type === "finish" || event.type === "abort" || event.type === "error") &&
      !finalized
    ) {
      return [...finalize(), line];
    }
    if (pendingTextEnd) {
      pendingFrames.push(line);
      return [];
    }
    return [line];
  };

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      lineBuffer += decoder.decode(chunk, { stream: true });
      const lines = lineBuffer.split("\n");
      lineBuffer = lines.pop() ?? "";
      for (const line of lines) {
        for (const out of processLine(line)) {
          controller.enqueue(encoder.encode(out + "\n"));
        }
      }
    },
    flush(controller) {
      // Degenerate streams that never sent a terminal UI-message frame.
      for (const out of finalize()) {
        controller.enqueue(encoder.encode(out + "\n"));
      }
      if (lineBuffer) controller.enqueue(encoder.encode(lineBuffer));
    },
  });
}
