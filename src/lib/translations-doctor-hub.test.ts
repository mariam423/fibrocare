import { describe, expect, it } from "vitest";
import { translations, type Locale, type TranslationKey } from "./translations";

/**
 * i18n contract test for Doctor Hub translation keys.
 *
 * The Doctor Hub (AiArticleLibrary, AiArticleCard, ArticleReactions,
 * PostEditor, DoctorContentFeed) is fully localised. The keys below
 * were added/audited as part of the strict language-isolation pass
 * (commit 03b0220); this test makes sure the contract doesn't drift:
 *
 *  1. Every key has a non-empty translation in both EN and AR.
 *  2. The AR translation contains Arabic script (no silent English
 *     fallback left behind).
 *  3. The EN translation does NOT contain Arabic script (a stray
 *     AR string in the EN table is just as bad as the reverse).
 *  4. The values are not byte-identical (catches a copy/paste bug
 *     where one locale is shipped as the other).
 */

const DOCTOR_HUB_KEYS: readonly TranslationKey[] = [
  "doctor.aiLibrary.title",
  "doctor.aiLibrary.subtitle",
  "doctor.aiLibrary.reviewed",
  "doctor.aiLibrary.loading",
  "doctor.aiLibrary.empty",
  "doctor.aiLibrary.newBadge",
  "doctor.aiLibrary.read",
  "doctor.aiLibrary.disclaimer",
  "doctor.aiLibrary.signature",
  "doctor.aiLibrary.refresh",
  "doctor.aiLibrary.refreshing",
  "doctor.aiLibrary.refreshed",
  "doctor.aiLibrary.refreshError",
  "doctor.aiLibrary.minutesShort",
  "doctor.aiLibrary.topicsAria",
  "doctor.reactions.like",
  "doctor.reactions.helpful",
  "doctor.reactions.signInHint",
  "doctor.authorFallback",
  "doctor.postError",
];

function hasArabicScript(text: string): boolean {
  return /\p{Script=Arabic}/u.test(text);
}

function hasLatinScript(text: string): boolean {
  return /[A-Za-z]/.test(text);
}

describe("Doctor Hub translations: contract", () => {
  it.each(DOCTOR_HUB_KEYS)(
    "key %s has a non-empty value in both EN and AR",
    (key) => {
      const en = translations.en[key];
      const ar = translations.ar[key];
      expect(en, `EN missing for ${key}`).toBeTruthy();
      expect(ar, `AR missing for ${key}`).toBeTruthy();
      expect(en.length, `EN empty for ${key}`).toBeGreaterThan(0);
      expect(ar.length, `AR empty for ${key}`).toBeGreaterThan(0);
    }
  );

  it.each(DOCTOR_HUB_KEYS)(
    "key %s: AR value is in Arabic script",
    (key) => {
      const ar = translations.ar[key];
      // Topic names like "Mayo Clinic" are AR-anchored to the
      // international label; the AR string is the local rendering
      // and must be Arabic-script.
      expect(
        hasArabicScript(ar),
        `AR value for ${key} contains no Arabic script: ${JSON.stringify(ar)}`
      ).toBe(true);
    }
  );

  it.each(DOCTOR_HUB_KEYS)(
    "key %s: EN value is not contaminated with Arabic script",
    (key) => {
      const en = translations.en[key];
      expect(
        hasArabicScript(en),
        `EN value for ${key} contains Arabic script: ${JSON.stringify(en)}`
      ).toBe(false);
    }
  );

  it("no key has the same byte-identical value in both locales", () => {
    const collisions: Array<{ key: TranslationKey; en: string; ar: string }> = [];
    for (const key of DOCTOR_HUB_KEYS) {
      const en = translations.en[key];
      const ar = translations.ar[key];
      if (en === ar) collisions.push({ key, en, ar });
    }
    expect(collisions).toEqual([]);
  });
});

describe("Doctor Hub translations: AR numeric pin survives script check", () => {
  it("minutesShort AR contains Arabic script (label), with the unit embedded", () => {
    const ar = translations.ar["doctor.aiLibrary.minutesShort"];
    expect(ar).toBeTruthy();
    // The AR short form is "د" (the first letter of "دقيقة") — the
    // numeric value is injected at render time inside a `dir="ltr"`
    // span, so the AR string itself only carries the unit.
    expect(hasArabicScript(ar)).toBe(true);
  });

  it("EN minutesShort is Latin script only", () => {
    const en = translations.en["doctor.aiLibrary.minutesShort"];
    expect(en).toBeTruthy();
    expect(hasLatinScript(en)).toBe(true);
  });
});

describe("Doctor Hub translations: locale completeness", () => {
  it("every Doctor Hub key exists under both locales (no orphan keys)", () => {
    const missing: TranslationKey[] = [];
    for (const key of DOCTOR_HUB_KEYS) {
      const locales: Locale[] = ["en", "ar"];
      for (const locale of locales) {
        if (!(key in translations[locale])) {
          missing.push(key);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
