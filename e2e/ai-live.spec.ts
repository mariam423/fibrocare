import { test, expect } from "@playwright/test";

/**
 * Live AI mode rendering check.
 *
 * Runs against `playwright.live.config.ts`, which starts a dedicated server
 * with a FAKE `GEMINI_API_KEY` (test-only env) so the real wiring is
 * exercised end to end: env → getAiStatus server action → AiStatusContext →
 * header badge + companion status line.
 *
 * IMPORTANT: this spec must never send a chat message or trigger any AI
 * feature — the key is fake, so the companion's chat and the AI feature
 * routes would attempt (and fail) a real provider call. It only asserts the
 * passive status UI, which does not call the provider.
 */
test("AI status badge and companion show Live · Gemini with a configured key", async ({
  page,
}) => {
  await test.step("dashboard loads", async () => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })
    ).toBeVisible();
  });

  await test.step("header badge resolves to Live · Gemini with live styling", async () => {
    const badge = page.locator("header [role=status]").first();
    // The badge starts at "Checking AI status…" while the shared context
    // fetches, then settles on the live state.
    await expect(badge).toContainText("Live · Gemini", { timeout: 30_000 });
    // Emerald = live (amber is mock, slate is offline).
    await expect(badge).toHaveClass(/emerald/);
    await expect(badge).not.toHaveClass(/amber/);
  });

  await test.step("companion agrees it is live, powered by Gemini", async () => {
    await page.getByRole("button", { name: "Open AI Care Companion" }).click();
    await expect(
      page.locator("section[role=dialog] header p")
    ).toHaveText(/Live · powered by Gemini/, { timeout: 20_000 });
  });
});
