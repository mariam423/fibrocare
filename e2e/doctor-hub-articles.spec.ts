import { test, expect } from "@playwright/test";
import { unlockPrivatePage } from "./helpers/privacy";

/**
 * End-to-end test for the AI-Generated Article Library on the Doctor Hub.
 *
 * Verifies that:
 *  - The Doctor Hub loads for an authenticated user.
 *  - The AI-Generated Article Library section renders with the curated topics.
 *  - The seed endpoint has populated at least one article on first visit
 *    so the public-facing feed is never empty.
 *  - The article cards show the doctor signature, authority label, and
 *    "Read article" trigger.
 *  - The article dialog opens and shows the full body in Markdown.
 *  - Switching to Arabic renders the Arabic title and labels.
 *  - On a phone-sized viewport the library is fully visible (no
 *    horizontal overflow) and the topic picker is horizontally
 *    scrollable.
 */
test.describe("Doctor Hub: AI-Generated Article Library", () => {
  test("library renders, opens an article, and supports Arabic", async ({
    page,
  }) => {
    // ---- English: load the hub and wait for the library. ----
    await unlockPrivatePage(page, "/pro/doctor");

    // The Doctor Hub may render in two modes (patient vs doctor) depending
    // on the signed-in user's role. The library is shown in both modes, so
    // we only assert on library-level structure.
    const library = page.getByTestId("ai-article-library");
    await expect(library).toBeVisible({ timeout: 60_000 });

    // Title and subtitle render with English translations.
    await expect(
      library.getByText("AI-Generated Article Library", { exact: true })
    ).toBeVisible();
    await expect(
      library.getByText(/Mayo Clinic and ACR guidance/i)
    ).toBeVisible();

    // Curated topic chips must be present (at least the "sleep-hygiene" one).
    const topicChip = page.getByTestId("ai-article-topic-sleep-hygiene");
    await expect(topicChip).toBeVisible({ timeout: 60_000 });

    // The grid must contain at least one card. The seed endpoint fills the
    // library on first visit; if it is still empty we wait up to 60s.
    const grid = page.getByTestId("ai-article-grid");
    await expect(grid).toBeVisible({ timeout: 60_000 });
    const cards = page.getByTestId("ai-article-card");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Each card has a title, authority label, and "Read article" button.
    const firstCard = cards.first();
    await expect(firstCard.getByTestId("ai-article-title")).toBeVisible();
    await expect(firstCard.getByTestId("ai-article-authority")).toBeVisible();
    await expect(firstCard.getByTestId("ai-article-author")).toBeVisible();

    const readButton = firstCard.getByTestId("ai-article-read");
    await expect(readButton).toBeVisible();
    await readButton.click();

    // The dialog opens with the Markdown body.
    const body = page.getByTestId("ai-article-body");
    await expect(body).toBeVisible({ timeout: 10_000 });
    // Body should have at least one Markdown heading rendered.
    await expect(body.locator("h2, h3").first()).toBeVisible();
    // Body should NOT contain the legacy cold-therapy recommendation.
    await expect(body).not.toContainText(/ice pack|cold compress|ice bath/i);

    // Close the dialog.
    await page.keyboard.press("Escape");
    await expect(body).toHaveCount(0, { timeout: 5_000 });
  });

  test("Arabic locale renders the localized title and AR-only strings", async ({
    page,
  }) => {
    // Seed the language preference before the app reads it on hydration.
    await page.addInitScript(() => {
      window.localStorage.setItem("fibrocare-language", "ar");
    });

    await unlockPrivatePage(page, "/pro/doctor");
    const library = page.getByTestId("ai-article-library");
    await expect(library).toBeVisible({ timeout: 60_000 });

    // Arabic title.
    await expect(
      library.getByText("مكتبة المقالات المولّدة بالذكاء الاصطناعي", { exact: true })
    ).toBeVisible({ timeout: 30_000 });
    // Arabic "medically reviewed" badge.
    await expect(library.getByText("موثّق طبياً", { exact: true })).toBeVisible();

    // Arabic topic chip exists.
    const topicChip = page.getByTestId("ai-article-topic-sleep-hygiene");
    await expect(topicChip).toBeVisible();
    await expect(topicChip).toContainText("نظافة النوم");
  });

  test("library fits a phone viewport with no horizontal overflow", async ({
    browser,
  }) => {
    // iPhone 12-class viewport (390×844). The library + topic picker +
    // cards must render without horizontal scrolling at the page level.
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    await unlockPrivatePage(page, "/pro/doctor");

    const library = page.getByTestId("ai-article-library");
    await expect(library).toBeVisible({ timeout: 60_000 });

    // Page must not scroll horizontally.
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(
      overflow.scrollWidth,
      "Page should not scroll horizontally on a phone viewport"
    ).toBeLessThanOrEqual(overflow.clientWidth + 1);

    // At least one card is rendered.
    const cards = page.getByTestId("ai-article-card");
    await expect(cards.first()).toBeVisible({ timeout: 60_000 });

    // The topic picker is the horizontally-scrollable container. On phone
    // it must allow horizontal scroll (scrollWidth > clientWidth on the
    // inner scroller) so the user can swipe to see all topics.
    const pickerMetrics = await page.evaluate(() => {
      const outer = document.querySelector(
        "[data-testid='ai-article-topics']"
      ) as HTMLElement | null;
      const inner = outer?.querySelector(
        "div.scrollbar-none"
      ) as HTMLElement | null;
      if (!outer || !inner) return null;
      return {
        outerWidth: outer.clientWidth,
        innerScrollWidth: inner.scrollWidth,
      };
    });
    expect(pickerMetrics, "topic picker container should exist").not.toBeNull();
    expect(
      pickerMetrics!.innerScrollWidth,
      "topic picker should be horizontally scrollable on phone"
    ).toBeGreaterThan(pickerMetrics!.outerWidth);

    // The "Read article" button on the first card is visible and the card
    // footer has stacked the author/button into a single column (so the
    // button has full width on this viewport).
    const firstCard = cards.first();
    const readButton = firstCard.getByTestId("ai-article-read");
    await expect(readButton).toBeVisible();
    const readBox = await readButton.boundingBox();
    expect(readBox, "Read button bounding box").not.toBeNull();
    expect(readBox!.height).toBeGreaterThanOrEqual(32);
    // Width of the button should be at least half the card width (since
    // we set w-full on mobile).
    const cardBox = await firstCard.boundingBox();
    expect(cardBox, "card bounding box").not.toBeNull();
    expect(readBox!.width).toBeGreaterThanOrEqual(cardBox!.width * 0.5);

    // Open the article dialog and confirm it covers the viewport on phone
    // (full-screen sheet, not a centered modal).
    await readButton.click();
    const body = page.getByTestId("ai-article-body");
    await expect(body).toBeVisible({ timeout: 10_000 });
    const dialogMetrics = await page.evaluate(() => {
      const popup = document.querySelector(
        "[data-slot='dialog-content']"
      ) as HTMLElement | null;
      if (!popup) return null;
      const r = popup.getBoundingClientRect();
      return { width: r.width, height: r.height, x: r.x, y: r.y };
    });
    expect(dialogMetrics, "dialog content should exist").not.toBeNull();
    // Full-screen on mobile: the dialog should span (almost) the full
    // viewport. Allow a 2px tolerance for borders/transforms.
    expect(
      Math.abs(dialogMetrics!.width - 390),
      "dialog should span viewport width on phone"
    ).toBeLessThanOrEqual(4);
    expect(dialogMetrics!.x).toBeLessThanOrEqual(2);

    await page.keyboard.press("Escape");
    await context.close();
  });
});
