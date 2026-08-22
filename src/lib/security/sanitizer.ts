/**
 * Input sanitization & XSS defense for user-generated text.
 *
 * React already escapes rendered strings, so this module defends the layers
 * React cannot see: values persisted to localStorage, forwarded to the AI
 * providers, embedded in exported files, or ever passed to dangerouslySet
 * territory downstream. Strategy: strip, never interpret.
 *
 *  - remove HTML tags and script/style blocks entirely;
 *  - neutralize entity-encoded and unicode tricks;
 *  - kill javascript:/data: URL payloads;
 *  - strip control characters (including RTL-override spoofing) while
 *    preserving legitimate Arabic text;
 *  - hard length caps so nobody stores megabytes in a note field.
 */

export interface SanitizeOptions {
  /** Hard character cap applied after cleaning (default 2000). */
  maxLength?: number;
  /** Collapse internal runs of whitespace (default true). */
  collapseWhitespace?: boolean;
}

const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_BLOCK_RE = /<\s*(script|style|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const DANGEROUS_URL_RE = /\b(?:javascript|vbscript|data)\s*:\s*[^>\s"']*/gi;
/** Control chars + bidi-override characters (keeps normal Arabic joiners). */
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202E\u200E\u200F]/g;

/** Escape a string for safe interpolation into HTML contexts. */
export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Sanitize free-form user text. Returns clean plain text; dangerous content
 * is removed, and obvious attack payloads collapse to an empty string.
 */
export function sanitizeUserText(raw: string, options: SanitizeOptions = {}): string {
  const { maxLength = 2000, collapseWhitespace = true } = options;
  if (typeof raw !== "string") return "";

  let text = raw;

  // 1. Decode a limited set of entities that hide tags FIRST, so an
  //    encoded payload is treated exactly like a raw one below.
  for (let i = 0; i < 3; i++) {
    const decoded = text
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;#0?3[89];/gi, "'");
    if (decoded === text) break;
    text = decoded;
  }

  // 2. Whole dangerous blocks (so their inner text does not survive).
  text = text.replace(SCRIPT_BLOCK_RE, "");
  text = text.replace(HTML_TAG_RE, "");

  // 3. URL-scheme payloads.
  text = text.replace(DANGEROUS_URL_RE, "");

  // 4. Control + bidi-override characters.
  text = text.replace(CONTROL_CHARS_RE, "");

  // 5. Whitespace + length.
  if (collapseWhitespace) {
    text = text.replace(/\s+/g, " ").trim();
  }
  return text.slice(0, maxLength);
}

/**
 * Sanitize a value destined for an attribute/URL slot (href, src, query).
 * Only same-origin-relative or http(s) URLs survive.
 */
export function sanitizeUrl(raw: string): string | null {
  const cleaned = sanitizeUserText(raw, { maxLength: 500 });
  if (!cleaned) return null;
  try {
    const url = new URL(cleaned, "https://example.invalid");
    if (url.protocol === "https:" || url.protocol === "http:") {
      return cleaned;
    }
    return null;
  } catch {
    // Relative path — fine.
    return cleaned.startsWith("/") ? cleaned : null;
  }
}

/** True when the input looks like an injection attempt (for logging/metrics). */
export function looksMalicious(raw: string): boolean {
  if (typeof raw !== "string") return false;
  // Fresh non-global regexes: avoids the stateful lastIndex pitfall of
  // reusing the /g patterns above with .test().
  return (
    /<\s*(script|style|iframe|object|embed|svg|math)[^>]*>/i.test(raw) ||
    /<[a-zA-Z!/][^>]*>/.test(raw) ||
    /\b(?:javascript|vbscript|data)\s*:/i.test(raw)
  );
}
