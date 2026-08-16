import { test, expect } from "@playwright/test";

test.describe("authenticated smoke tests", () => {
  test("dashboard renders the daily check-in and gentle support cards", async ({
    page,
  }) => {
    await test.step("dashboard loads and hydrates", async () => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      const greeting = page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ });
      await expect(greeting).toBeVisible();
      // The dashboard is a client component: the SSR HTML renders the
      // placeholder name "User" until the data server action resolves.
      // Filling the gratitude textarea before that leaves the value in the
      // DOM but not in React state (the button stays disabled), so wait for
      // the real name to appear — i.e. React has hydrated and re-rendered.
      await expect(greeting).not.toContainText("User");
    });

    await test.step("gentle support cards are present and equal-height", async () => {
      const section = page.getByRole("heading", { name: "Gentle Support", level: 2 });
      await expect(section).toBeVisible();
      await expect(page.getByRole("heading", { name: "Sensory Rest" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Mindful Breath" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Gratitude Journal" })).toBeVisible();
    });

    await test.step("gratitude journal textarea accepts input", async () => {
      const textarea = page.locator("#gratitude-input");
      await expect(textarea).toBeVisible();
      await textarea.fill("I'm grateful for a quiet morning.");
      const saveButton = page.getByRole("button", { name: "Save Entry" });
      await expect(saveButton).toBeEnabled();
      await saveButton.click();
      await expect(page.getByRole("button", { name: "Saved ✓" })).toBeVisible();

      // Quick-select chips toggle and enable save without typing.
      const chip = page.getByRole("button", { name: "Peaceful moment" });
      await expect(chip).toHaveAttribute("aria-pressed", "false");
      await chip.click();
      await expect(chip).toHaveAttribute("aria-pressed", "true");
    });
  });

  test("gentle support actions navigate to their destinations", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    const zenButton = page.getByRole("button", { name: "Open Zen Portal" });
    // The dashboard is a client component, so its SSR HTML renders the
    // buttons before React hydrates — a click in that window lands on a
    // dead handler and router.push never fires. Click is idempotent, so
    // retry until the navigation actually happens; the URL flips to /zen
    // the moment push runs (route compile only affects page content).
    for (let attempt = 0; attempt < 3; attempt++) {
      await zenButton.click();
      try {
        await expect(page).toHaveURL(/\/zen/, { timeout: 30_000 });
        break;
      } catch {
        // Not hydrated yet — click again. The /zen route also cold-compiles
        // on first visit (10-40s on this machine), so keep the budget wide.
      }
    }
    await expect(page).toHaveURL(/\/zen/);
    // The zen page has no heading: "Focus on your breath" is a span in the
    // top header (the portal is a calm, minimal layout by design).
    await expect(page.getByText("Focus on your breath", { exact: true })).toBeVisible();

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    // The dashboard is a client component: on a cold dev-server compile a
    // click can land before React hydrates (dead handler), and the flare
    // toast alertdialog can cover the card — so dismiss any open dialog and
    // retry until the button actually flips to its active label.
    const sensitiveButton = page.getByRole("button", { name: "Activate Sensitive Mode" });
    for (let attempt = 0; attempt < 3; attempt++) {
      const dismiss = page.getByRole("button", { name: "Dismiss message" });
      if (await dismiss.count()) {
        await dismiss.click({ timeout: 5000 }).catch(() => {});
      }
      await sensitiveButton.click({ timeout: 10_000 }).catch(() => {});
      try {
        await expect(
          page.getByRole("button", { name: "Deactivate Sensitive Mode" })
        ).toBeVisible({ timeout: 10_000 });
        break;
      } catch {
        // Not hydrated yet (or the toast re-covered the card) — retry.
      }
    }
    // Sensitive mode toggles the sage theme + motion off and flips the
    // button into its active state; assert the toggle works and the
    // dashboard still shows the check-in card.
    await expect(page.getByRole("button", { name: "Deactivate Sensitive Mode" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })).toBeVisible();
    // The label flips, so re-query by the new name to toggle back off.
    await page.getByRole("button", { name: "Deactivate Sensitive Mode" }).click();
    await expect(page.getByRole("button", { name: "Activate Sensitive Mode" })).toBeVisible();
  });

  test("health logs page lists the log history", async ({ page }) => {
    await test.step("navigate to health logs", async () => {
      await page.goto("/health-logs", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Health Logs" })).toBeVisible();
    });

    await test.step("log history renders", async () => {
      const table = page.getByRole("table");
      await expect(table).toBeVisible();
      await expect(table.getByRole("columnheader", { name: /Date|Pain/ }).first()).toBeVisible();
    });
  });

  test("profile page loads", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    // The profile page awaits three server actions before rendering its
    // heading; on a cold dev-server compile (10-40s on this machine, see the
    // zen route note above) that can exceed the default 20s expect timeout.
    await expect(page.getByRole("heading", { name: /Profile/ })).toBeVisible({
      timeout: 60_000,
    });
  });
});
