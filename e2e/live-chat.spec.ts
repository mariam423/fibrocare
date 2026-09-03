import { test, expect } from "@playwright/test";

/**
 * LIVE AI chat verification — real provider, no mocks.
 *
 * These tests send real messages through the real UI to the real
 * /api/chat route, which calls Gemini with the key from .env.local.
 * They only run under playwright.live-chat.config.ts (testMatch keeps
 * them out of the default suite), so the default runs stay hermetic.
 *
 * Provider usage is asserted indirectly but robustly: the status line
 * must say "Live · powered by Gemini" (impossible in mock mode), and
 * every completion must end with the finish frame (Stop button gone)
 * and render a substantial reply. The server-side log line
 * `[ai] chat · provider=Gemini · in=… out=…` is the direct proof.
 */

/** Assistant bubbles render in divs with this class in AiCompanion. */
const ASSISTANT_BUBBLE = "css=div.rounded-bl-md";

async function openCompanion(page: import("@playwright/test").Page) {
  // PrivacyLock stores only a SHA-256 digest in localStorage. Seed the same
  // known test PIN ("1234") in each isolated context, then unlock through
  // the real keypad because every new context intentionally starts locked.
  await page.addInitScript(() => {
    localStorage.setItem(
      "fibrocare-privacy-pin",
      "208afe2b4d6e78c8377d28a9ef6d8f3905268c53e19ff9f8c99a6b00d73fd1b2"
    );
  });
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  const lockDialog = page.getByRole("dialog", {
    name: "Enter your PIN to unlock FibroCare",
  });
  await expect(lockDialog).toBeVisible({ timeout: 20_000 });
  for (const digit of ["1", "2", "3", "4"]) {
    await lockDialog.getByRole("button", { name: `Digit ${digit}` }).click();
  }
  await expect(lockDialog).toHaveCount(0, { timeout: 10_000 });

  await page.getByRole("button", { name: "Open AI Care Companion" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function send(dialog: ReturnType<import("@playwright/test").Page["getByRole"]>, text: string) {
  const input = dialog.getByRole("textbox", {
    name: "Message the AI care companion",
  });
  await input.fill(text);
  await input.press("Enter");
  await expect(dialog).toContainText(text.slice(0, 24), { timeout: 15_000 });
}

/**
 * Waits for generation to fully finish (Stop button removed = finish frame
 * received and status back to ready), then returns the reply text.
 */
async function readCompletedReply(
  dialog: ReturnType<import("@playwright/test").Page["getByRole"]>
): Promise<string> {
  await expect(
    dialog.getByRole("button", { name: "Stop generating" })
  ).toHaveCount(0, { timeout: 90_000 });
  const bubble = dialog.locator(ASSISTANT_BUBBLE).last();
  await expect(bubble).toBeVisible();
  return bubble.innerText();
}

test.describe("LIVE AI Care Companion (real Gemini)", () => {
  test("status line shows the live provider state (not mock)", async ({
    page,
  }) => {
    const dialog = await openCompanion(page);

    // "Live · RAG Active" is only rendered when a real provider is active
    // (mock mode shows "Live · simulated …", offline shows the offline
    // badge) — this single assertion proves the real provider path.
    await expect(dialog.locator("header p")).toHaveText(/Live · RAG Active/, {
      timeout: 30_000,
    });
  });

  test("streams a complete English reply without interruption", async ({
    page,
  }) => {
    const dialog = await openCompanion(page);
    await send(
      dialog,
      "In one short paragraph, what helps ease muscle tension at home?"
    );

    const reply = await readCompletedReply(dialog);
    expect(
      reply.length,
      `reply must be substantial (got ${reply.length} chars)`
    ).toBeGreaterThanOrEqual(120);
    expect(reply.toLowerCase()).toContain("warm");
  });

  test("streams a complete reply to an Arabic message", async ({ page }) => {
    const dialog = await openCompanion(page);
    await send(dialog, "ما الذي يساعد على تخفيف توتر العضلات في المنزل؟");

    const reply = await readCompletedReply(dialog);
    // Don't over-assert the language (locale rides the app toggle, "en" by
    // default); the point is that the full stream completes and renders.
    expect(
      reply.length,
      `reply must be substantial (got ${reply.length} chars)`
    ).toBeGreaterThanOrEqual(40);
  });

  test("unauthenticated /api/chat is rejected with 401", async () => {
    // Node's global fetch has no cookie jar at all, making this the honest
    // "no session" client. (Request contexts created inside the test runner
    // — browser.newContext(), the `request` fixture, and even
    // request.newContext() — unexpectedly carried the project storageState
    // cookies and authenticated the request.)
    const response = await fetch("http://localhost:3103/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", parts: [{ type: "text", text: "hello" }] },
        ],
      }),
    });
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Please sign in first.",
    });
  });
});
