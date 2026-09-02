import { test, expect } from "@playwright/test";

const CHAT_RESPONSE =
  "The mock companion has reviewed your recent logs. Your pain trend is stable, and a warm compress may help.";

async function preparePrivateDashboard(
  page: import("@playwright/test").Page,
  target = "/dashboard"
) {
  // PrivacyLock stores only a SHA-256 digest in localStorage. Seed the same
  // known test PIN in each isolated context, then unlock through the real
  // keypad because every new context intentionally starts locked.
  await page.addInitScript(() => {
    localStorage.setItem(
      "fibrocare-privacy-pin",
      "208afe2b4d6e78c8377d28a9ef6d8f3905268c53e19ff9f8c99a6b00d73fd1b2"
    );
  });
  await page.goto(target, { waitUntil: "domcontentloaded" });

  const lockDialog = page.getByRole("dialog", {
    name: "Enter your PIN to unlock FibroCare",
  });
  await expect(lockDialog).toBeVisible({ timeout: 20_000 });
  for (const digit of ["1", "2", "3", "4"]) {
    await lockDialog.getByRole("button", { name: `Digit ${digit}` }).click();
  }
  await expect(lockDialog).toHaveCount(0, { timeout: 10_000 });
}

function chatStream(messageId = "e2e-response") {
  const chunks = [
    { type: "start", messageId },
    { type: "start-step" },
    { type: "text-start", id: "e2e-text" },
    ...CHAT_RESPONSE.match(/\S+\s*|\s+/g)!.map((delta) => ({
      type: "text-delta",
      id: "e2e-text",
      delta,
    })),
    { type: "text-end", id: "e2e-text" },
    { type: "finish-step" },
    { type: "finish", finishReason: "stop" },
  ];

  return chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("");
}

async function openCompanion(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Open AI Care Companion" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function sendChatMessage(
  dialog: ReturnType<import("@playwright/test").Page["getByRole"]>,
  text: string
) {
  const input = dialog.getByRole("textbox", {
    name: "Message the AI care companion",
  });
  await input.fill(text);
  await input.press("Enter");
}

test.describe("authenticated AI Care Companion", () => {
  test("sends a message and renders the complete streamed response", async ({
    page,
  }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: chatStream(),
      });
    });

    await preparePrivateDashboard(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("button", { name: "Open AI Care Companion" })).toBeVisible();

    await page.getByRole("button", { name: "Open AI Care Companion" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const input = dialog.getByRole("textbox", {
      name: "Message the AI care companion",
    });
    await input.fill("Any patterns in my logs?");
    await input.press("Enter");

    await expect(dialog).toContainText("Any patterns in my logs?");
    await expect(dialog).toContainText(CHAT_RESPONSE, { timeout: 30_000 });
    await expect(dialog.getByText("The mock companion has reviewed")).toBeVisible();
    await expect(dialog.getByText("warm compress may help.")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Stop generating" })).toHaveCount(0);
  });

  test("shows session expiry recovery and redirects to login", async ({
    page,
  }) => {
    await page.route("**/api/chat", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Please sign in first." }),
      });
    });

    await preparePrivateDashboard(page, "/dashboard?tab=care");
    await expect(page).toHaveURL(/\/dashboard\?tab=care/);
    await expect(page.getByRole("button", { name: "Open AI Care Companion" })).toBeVisible();

    await page.getByRole("button", { name: "Open AI Care Companion" }).click();
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("textbox", {
      name: "Message the AI care companion",
    });
    await input.fill("Please check my latest logs");
    await input.press("Enter");

    await expect(page.getByTestId("chat-session-expired")).toBeVisible();
    await expect(page.getByTestId("chat-session-expired")).toContainText(
      "Your chat session expired"
    );
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard%3Ftab%3Dcare$/, {
      timeout: 10_000,
    });
  });

  test("auto-recovers when a stream ends without any content", async ({
    page,
  }) => {
    // First attempt: a protocol-valid stream that finishes without ever
    // producing text (provider hiccup) — the turn would render as a frozen
    // empty bubble without the one-shot automatic regenerate.
    let attempt = 0;
    await page.route("**/api/chat", async (route) => {
      attempt += 1;
      if (attempt === 1) {
        await route.fulfill({
          status: 200,
          contentType: "text/event-stream",
          body:
            [
              { type: "start", messageId: "e2e-empty" },
              { type: "start-step" },
              { type: "finish-step" },
              { type: "finish", finishReason: "stop" },
            ]
              .map((chunk) => `data: ${JSON.stringify(chunk)}\\n\\n`)
              .join(""),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: chatStream(),
      });
    });

    await preparePrivateDashboard(page);
    const dialog = await openCompanion(page);
    await sendChatMessage(dialog, "Any patterns in my logs?");

    // The retried (second) attempt must render the full reply with no user
    // action — exactly one automatic recovery, then the answer completes.
    await expect(dialog).toContainText(CHAT_RESPONSE, { timeout: 30_000 });
  });

  test("offers manual retry after a network failure and completes the reply", async ({
    page,
  }) => {
    let attempt = 0;
    await page.route("**/api/chat", async (route) => {
      attempt += 1;
      if (attempt === 1) {
        await route.abort("connectionreset");
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "text/event-stream",
        body: chatStream(),
      });
    });

    await preparePrivateDashboard(page);
    const dialog = await openCompanion(page);
    await sendChatMessage(dialog, "Please check my latest logs");

    // The transport error surfaces the inline error with a recovery action.
    const retryButton = dialog.getByRole("button", { name: "Try again" });
    await expect(retryButton).toBeVisible({ timeout: 20_000 });

    await retryButton.click();
    await expect(dialog).toContainText(CHAT_RESPONSE, { timeout: 30_000 });
    await expect(retryButton).toHaveCount(0);
  });
});
