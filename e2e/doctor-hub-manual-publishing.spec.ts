import { test, expect } from "@playwright/test";
import { unlockPrivatePage } from "./helpers/privacy";

/**
 * End-to-end coverage for the Doctor Hub surfaces that need a doctor-role
 * account:
 *  1. The AI-Generated Article Library renders for the doctor (the
 *     dedup-invariant assertions cover Batch B's "Fix duplicate articles"
 *     work — the same article must never appear twice even after a
 *     full-library refresh).
 *  2. The manual publishing composer is reachable, accepts a title +
 *     body + tags, and submits a new post that then appears in the
 *     doctor's editorial workspace (DoctorOwnPosts).
 *  3. The "Refresh library" action walks the curated topics and
 *     surfaces any new posts without introducing duplicates.
 *
 * The throwaway E2E account is promoted to the `doctor` role by
 * `e2e/auth.setup.ts` via the gated `/api/e2e/promote-doctor` endpoint
 * so the doctor-only Composer section is rendered.
 */
test.describe("Doctor Hub: manual publishing + library", () => {
  test("library has no duplicate article cards", async ({ page }) => {
    await unlockPrivatePage(page, "/pro/doctor");

    const grid = page.getByTestId("ai-article-grid");
    await expect(grid).toBeVisible({ timeout: 60_000 });

    const cards = page.getByTestId("ai-article-card");
    // Wait for at least one card to render before counting.
    await expect(cards.first()).toBeVisible({ timeout: 60_000 });

    // Collect all card titles; duplicates would surface as a Set whose
    // size is smaller than the rendered count. The library must show
    // each curated topic at most once.
    const titles = await cards
      .locator("[data-testid='ai-article-title']")
      .allTextContents();
    const unique = new Set(titles.map((t) => t.trim()));
    expect(
      unique.size,
      `library should not show duplicate titles: ${JSON.stringify(titles)}`
    ).toBe(titles.length);
  });

  test("refresh library keeps the grid duplicate-free", async ({ page }) => {
    await unlockPrivatePage(page, "/pro/doctor");

    const grid = page.getByTestId("ai-article-grid");
    await expect(grid).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("ai-article-card").first()).toBeVisible({
      timeout: 60_000,
    });

    const refreshButton = page.getByTestId("ai-article-refresh");
    await expect(refreshButton).toBeVisible();
    // The refresh sweep walks every curated topic and may take a while
    // because each topic hits the AI provider (mock in dev). Use a long
    // action timeout so the click + the network work have headroom.
    await refreshButton.click({ timeout: 15_000 });

    // After the sweep, the grid should still be visible (the sweep is
    // a no-op if everything is already published) and must have no
    // duplicate titles. Re-asserting here guards against a regression
    // where the sweep inserts a duplicate of an existing post.
    await expect(grid).toBeVisible({ timeout: 120_000 });
    const titlesAfter = await page
      .getByTestId("ai-article-card")
      .locator("[data-testid='ai-article-title']")
      .allTextContents();
    const uniqueAfter = new Set(titlesAfter.map((t) => t.trim()));
    expect(
      uniqueAfter.size,
      `library should not show duplicate titles after refresh: ${JSON.stringify(titlesAfter)}`
    ).toBe(titlesAfter.length);
  });

  test("doctor can publish a manual post and see it in own-posts", async ({
    page,
  }) => {
    await unlockPrivatePage(page, "/pro/doctor");

    // The manual publishing card is only rendered for the doctor
    // role; the throwaway account is promoted by auth.setup.ts.
    const composer = page.getByTestId("doctor-manual-publishing");
    await expect(composer).toBeVisible({ timeout: 60_000 });

    const toggle = page.getByTestId("doctor-manual-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();

    // The editor is rendered inline below the toggle. Inputs are
    // stable across re-renders because they're keyed by state inside
    // the same component.
    const titleInput = page.getByTestId("doctor-post-title");
    const contentInput = page.getByTestId("doctor-post-content");
    const tagsInput = page.getByTestId("doctor-post-tags");
    await expect(titleInput).toBeVisible({ timeout: 30_000 });
    await expect(contentInput).toBeVisible();
    await expect(tagsInput).toBeVisible();

    // Use a unique, timestamped title so the assertion below is
    // robust to prior runs that may have left posts in the DB.
    const stamp = Date.now();
    const title = `E2E manual post ${stamp}`;
    const body =
      `This is a Playwright-authored manual post for the doctor hub. ` +
      `It exercises the manual publishing composer end-to-end. ` +
      `[${stamp}]`;
    const tags = "e2e,manual,doctor-hub";

    await titleInput.fill(title);
    await contentInput.fill(body);
    await tagsInput.fill(tags);

    const publish = page.getByTestId("doctor-post-publish");
    await expect(publish).toBeEnabled();
    await publish.click();

    // On success the composer reports a localized success message and
    // the workspace re-renders the doctor's own posts. The success
    // indicator is gated by translations; assert either the inline
    // success text appears OR the new entry shows up below in the
    // own-posts workspace (whichever is faster, with generous
    // timeouts for cold compiles).
    const successOrOwnPosts = await Promise.race([
      page
        .getByTestId("doctor-post-success")
        .waitFor({ state: "visible", timeout: 60_000 })
        .then(() => "success"),
      page
        .getByTestId("doctor-own-posts")
        .waitFor({ state: "visible", timeout: 60_000 })
        .then(() => "own-posts"),
    ]);
    expect(["success", "own-posts"]).toContain(successOrOwnPosts);

    // Whichever path won, the workspace should now contain the new
    // post. The "own-posts" list is loaded asynchronously after
    // publish, so wait for it explicitly.
    const ownPosts = page.getByTestId("doctor-own-posts");
    await expect(ownPosts).toBeVisible({ timeout: 60_000 });
    await expect(ownPosts).toContainText(title);
  });

  /**
   * Page-level dedup regression test. Both the AI library and the
   * manual "Doctor Insights" feed pull from the same `DoctorPost`
   * table; before the `source` discriminator landed, AI articles
   * rendered in BOTH sections. The two surfaces must now show
   * disjoint sets: an AI library card must not also appear as a
   * manual feed card, and vice versa.
   *
   * For a doctor session (the throwaway account is promoted to
   * the `doctor` role by auth.setup.ts) the page renders BOTH
   * surfaces, so the assertion is meaningful here. For a plain
   * user session, only the library is rendered, so this test is
   * only meaningful in the doctor path — it lives in this spec
   * because it's a Doctor Hub invariant.
   */
  test("AI library and Doctor Insights show disjoint post sets", async ({
    page,
  }) => {
    await unlockPrivatePage(page, "/pro/doctor");

    // Wait for the AI library to populate before snapshotting titles.
    const libraryGrid = page.getByTestId("ai-article-grid");
    await expect(libraryGrid).toBeVisible({ timeout: 60_000 });
    await expect(page.getByTestId("ai-article-card").first()).toBeVisible({
      timeout: 60_000,
    });
    const libraryTitles = new Set(
      (
        await page
          .getByTestId("ai-article-card")
          .locator("[data-testid='ai-article-title']")
          .allTextContents()
      ).map((t) => t.trim())
    );

    // The manual feed surface is the "Doctor Insights" section
    // (translation key: doctor.feedTitle). It may legitimately be
    // empty if no manual posts exist yet — that's OK, the assertion
    // is "no overlap" which is vacuously true.
    const feedTitle = "رؤى الأطباء";
    const insightsHeading = page.getByRole("heading", { name: feedTitle });
    if ((await insightsHeading.count()) === 0) {
      // No manual feed rendered → nothing to compare against.
      return;
    }
    await expect(insightsHeading).toBeVisible({ timeout: 60_000 });

    // The feed renders post titles inside the same CardTitle
    // elements. We pull the whole page's H3s inside the section
    // that follows the heading, so the AI library cards above
    // the heading don't pollute the set.
    const insightsSection = page
      .locator("section, div")
      .filter({ has: insightsHeading })
      .first();
    const insightsTitles = (
      await insightsSection.locator("h3").allTextContents()
    ).map((t) => t.trim());

    for (const title of insightsTitles) {
      expect(
        libraryTitles.has(title),
        `Post "${title}" appears in both AI library and Doctor Insights`
      ).toBe(false);
    }
  });
});
