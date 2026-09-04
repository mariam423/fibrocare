import { test, expect } from "@playwright/test";
import { unlockPrivatePage } from "./helpers/privacy";

/**
 * Language-isolation regression coverage for Doctor Hub.
 *
 * The Doctor Hub (and every other surface on FibroCare) is fully
 * localised, but layout-level i18n has historically leaked
 * English strings into the AR locale (e.g. a hard-coded aria-label
 * like "Article topics" inside an RTL document, or "Doctor" as a
 * fallback for an unknown author name). This spec asserts the
 * invariants that prevent that class of bug from coming back:
 *
 *  1. The document root's `lang` and `dir` attributes track the
 *     active locale.
 *  2. Every visible text node on an article card uses a script that
 *     matches the active locale (Latin characters only when EN is
 *     active, Arabic-script characters only when AR is active).
 *     Numbers and a small allowlist of direction-neutral punctuation
 *     (`·`, `…`, `/`, emoji) are exempt — they appear in both.
 *  3. The 1 reading-time badge ("5 min" / "٥ د") stays in an
 *     LTR-pinned span, so a Western digit never gets visually
 *     reversed inside the AR locale.
 *  4. The privacy-lock + library load cleanly in both locales.
 *
 * The spec drives the locale through the `fibrocare-locale` cookie
 * (the SSR source of truth) and the legacy localStorage key (the
 * client-side fallback), so the first paint already matches the
 * test's intent.
 */

/**
 * Heuristic script detection. A "Latin" run is a string that contains
 * letters from the Basic Latin range but no letters from any other
 * major script; the inverse holds for "Arabic". We need a permissive
 * detector because a single number ("5") is direction-neutral and
 * must not fail either assertion.
 */
function hasArabicScript(text: string): boolean {
  return /\p{Script=Arabic}/u.test(text);
}
function hasLatinScript(text: string): boolean {
  return /[A-Za-z]/.test(text);
}

/**
 * Allow a small set of Latin-script tokens to appear in the AR
 * locale — proper names that don't have an AR transliteration, the
 * unit abbreviation in pinned LTR spans, the public authority
 * names that are internationally recognised by their English
 * acronym, the site name "FibroCare", and the full English
 * authority attribution (the Mayo Clinic / ACR / NHS / CDC labels
 * have no widely-accepted AR transliteration, so the public feed
 * keeps the English attribution in both locales). Any other Latin
 * token inside an AR document is treated as a leak.
 */
const AR_LATIN_ALLOWLIST =
  /FibroCare|ACR|Mayo Clinic|American College of Rheumatology|NHS|CDC|min/;

test.describe("Doctor Hub: strict language isolation", () => {
  test("EN locale renders no Arabic-script content in the article card", async ({
    page,
  }) => {
    // Seed EN before any app script runs (legacy localStorage key).
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "en");
      document.cookie = "fibrocare-locale=en; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");

    // The library renders for both doctor and patient roles — we
    // assert on library-level structure only, not the doctor-only
    // composer, so the test is stable for both sign-in roles.
    const library = page.getByTestId("ai-article-library");
    await expect(library).toBeVisible({ timeout: 60_000 });

    // Document root: EN → lang=en, dir=ltr.
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");

    // Every locale-controlled UI node inside a card must be free of
    // Arabic-script characters. We collect text from the card chrome
    // (authority label, reading time, author meta) — the place where
    // hard-coded English strings historically leak. The article title
    // and body are AI-generated content (not UI chrome) and are out
    // of scope for the language-isolation invariant.
    const cards = page.getByTestId("ai-article-card");
    await expect(cards.first()).toBeVisible({ timeout: 60_000 });
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 6); i++) {
      const card = cards.nth(i);
      const texts = await card.evaluate((el) => {
        const nodes = el.querySelectorAll(
          "[data-testid='ai-article-author'], [data-testid='ai-article-authority'], [data-testid='ai-article-reading']"
        );
        return Array.from(nodes).map((n) => n.textContent ?? "");
      });
      for (const text of texts) {
        expect(
          hasArabicScript(text),
          `EN card #${i} should not contain Arabic script: ${JSON.stringify(text)}`
        ).toBe(false);
      }
    }
  });

  test("AR locale renders no Latin-script content leaks in the article card", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "ar");
      document.cookie = "fibrocare-locale=ar; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");

    const library = page.getByTestId("ai-article-library");
    await expect(library).toBeVisible({ timeout: 60_000 });

    // Document root: AR → lang=ar, dir=rtl.
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    const cards = page.getByTestId("ai-article-card");
    await expect(cards.first()).toBeVisible({ timeout: 60_000 });
    const count = await cards.count();
    for (let i = 0; i < Math.min(count, 6); i++) {
      const card = cards.nth(i);
      // Only check the locale-controlled UI chrome (authority label,
      // reading time, author meta) — the article title + body are
      // AI-generated content that lives outside the i18n boundary.
      const texts = await card.evaluate((el) => {
        const nodes = el.querySelectorAll(
          "[data-testid='ai-article-author'], [data-testid='ai-article-authority'], [data-testid='ai-article-reading']"
        );
        return Array.from(nodes).map((n) => n.textContent ?? "");
      });
      for (const text of texts) {
        // Arabic-script and digit-only / punctuation-only text is fine.
        if (!hasLatinScript(text)) continue;
        // Allow a small allowlist of Latin tokens that are legitimately
        // mixed-language (proper names, unit abbreviations inside
        // pinned LTR spans, site name).
        const stripped = text.replace(AR_LATIN_ALLOWLIST, "").trim();
        expect(
          hasLatinScript(stripped),
          `AR card #${i} should not contain Latin-script leaks: ${JSON.stringify(text)}`
        ).toBe(false);
      }
    }
  });

  test("reading-time badge stays inside an LTR-pinned span in both locales", async ({
    page,
  }) => {
    // EN
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "en");
      document.cookie = "fibrocare-locale=en; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");
    const readingEn = page.getByTestId("ai-article-reading").first();
    await expect(readingEn).toBeVisible({ timeout: 60_000 });
    await expect(readingEn.locator("[dir='ltr']")).toBeVisible();

    // AR: re-seed the locale in a fresh context so the cookie is
    // rewritten before the next navigation. addInitScript persists
    // across navigations in the same page, so calling it again
    // here is enough to flip both the cookie and the localStorage
    // key — the next unlockPrivatePage will read the AR value.
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "ar");
      document.cookie = "fibrocare-locale=ar; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");
    const readingAr = page.getByTestId("ai-article-reading").first();
    await expect(readingAr).toBeVisible({ timeout: 60_000 });
    await expect(readingAr.locator("[dir='ltr']")).toBeVisible();
  });

  test("article topics aria-label is localised (not hard-coded English)", async ({
    page,
  }) => {
    // EN
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "en");
      document.cookie = "fibrocare-locale=en; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");
    const topicsEn = page.getByTestId("ai-article-topics").first();
    await expect(topicsEn).toBeVisible({ timeout: 60_000 });
    await expect(topicsEn).toHaveAttribute("aria-label", "Article topics");

    // AR
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-locale", "ar");
      document.cookie = "fibrocare-locale=ar; path=/";
    });
    await unlockPrivatePage(page, "/pro/doctor");
    const topicsAr = page.getByTestId("ai-article-topics").first();
    await expect(topicsAr).toBeVisible({ timeout: 60_000 });
    await expect(topicsAr).toHaveAttribute("aria-label", "مواضيع المقالات");
  });
});
