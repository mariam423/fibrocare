import type { Locale } from "@/lib/translations";

/**
 * Locale persistence, shared between the server and the client.
 *
 * The locale lives in a plain cookie (`fibrocare-locale`) so the root layout
 * can render `lang`/`dir` and the translated strings server-side, which makes
 * SSR and hydration agree (no hydration mismatch). The client provider writes
 * the same cookie when the user toggles the language, and keeps a
 * localStorage copy for the legacy pre-cookie path.
 */
export const LOCALE_COOKIE = "fibrocare-locale";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Parses a cookie/raw value into a Locale, defaulting to "en". */
export function parseLocale(value: string | null | undefined): Locale {
  return value === "ar" ? "ar" : "en";
}
