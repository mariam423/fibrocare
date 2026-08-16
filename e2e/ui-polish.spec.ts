import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * UI polish smoke checks for the crisp-canvas design pass:
 *
 *   - The tactile segmented preset control on the dashboard (glow indicator
 *     follows the active segment).
 *   - The empathetic toast that appears when a severe flare is logged.
 *   - The segmented severity filter on /health-logs and the insight filter
 *     on /reports.
 *   - Light and dark mode coverage for the dashboard surfaces.
 *
 * Hydration: the dashboard is a client component, so its SSR HTML renders
 * the controls before React hydrates — a click in that window lands on a
 * dead handler. `awaitHydratedDashboard` waits until the greeting stops
 * showing the SSR placeholder name, proving the client data fetch and
 * hydration both completed.
 */
test.describe("UI polish smoke", () => {
  /** Waits until the dashboard data fetch has completed and React has
   *  hydrated: the greeting then replaces the SSR placeholder name. A
   *  generous timeout covers cold-compile stalls during full-suite runs. */
  async function awaitHydratedDashboard(page: Page) {
    const greeting = page.getByRole("heading", {
      name: /Good (morning|afternoon|evening)/,
    });
    await expect(greeting).toBeVisible();
    await expect(greeting).not.toContainText("User", { timeout: 30_000 });
  }

  /** The last-logged flare toast can auto-show on load (pain >= 7 from an
   *  earlier run). Dismiss it so the test controls when the toast appears. */
  async function dismissToastIfVisible(page: Page) {
    const toast = page.getByRole("alertdialog");
    if (await toast.count()) {
      await page.getByRole("button", { name: "Dismiss message" }).click();
      await expect(toast).not.toBeVisible();
    }
  }

  /** The glow dot on the active segment (see QuickPresets). */
  const glowDot = (segment: Locator) => segment.getByTestId("preset-glow");

  test("dashboard segmented presets render and toggle in light mode", async ({ page }) => {
    await test.step("load the hydrated dashboard", async () => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await awaitHydratedDashboard(page);
    });

    await test.step("select Severe Flare — it activates and gains the glow", async () => {
      const presets = page.getByRole("group", { name: "Quick check-in presets" });
      await expect(presets).toBeVisible();
      const severeFlare = presets.getByRole("button", { name: "Severe Flare" });

      await severeFlare.click();
      await expect(severeFlare).toHaveAttribute("aria-pressed", "true");
      await expect(presets.getByRole("button", { name: "Calm Day" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      await expect(presets.getByRole("button", { name: "Mild Flare" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      await expect(glowDot(severeFlare)).toHaveCSS("opacity", "1");
    });

    await test.step("select Calm Day — the active state and glow move", async () => {
      const presets = page.getByRole("group", { name: "Quick check-in presets" });
      const calmDay = presets.getByRole("button", { name: "Calm Day" });
      const severeFlare = presets.getByRole("button", { name: "Severe Flare" });

      await calmDay.click();
      await expect(calmDay).toHaveAttribute("aria-pressed", "true");
      await expect(severeFlare).toHaveAttribute("aria-pressed", "false");
      await expect(glowDot(calmDay)).toHaveCSS("opacity", "1");
      await expect(glowDot(severeFlare)).toHaveCSS("opacity", "0");
    });
  });

  test("logging a severe flare surfaces the empathetic toast", async ({ page }) => {
    await test.step("load the hydrated dashboard", async () => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await awaitHydratedDashboard(page);
      await dismissToastIfVisible(page);
    });

    await test.step("log a Severe Flare preset", async () => {
      await page
        .getByRole("group", { name: "Quick check-in presets" })
        .getByRole("button", { name: "Severe Flare" })
        .click();
    });

    await test.step("the empathetic toast appears with its actions", async () => {
      const toast = page.getByRole("alertdialog");
      await expect(toast).toBeVisible();
      await expect(toast).toContainText("We're here with you");
      await expect(toast.getByRole("button", { name: "Calming Mode" })).toBeVisible();
      await expect(toast.getByRole("button", { name: "Zen Portal" })).toBeVisible();
    });

    await test.step("Escape dismisses it cleanly", async () => {
      await page.keyboard.press("Escape");
      await expect(page.getByRole("alertdialog")).not.toBeVisible();
    });
  });

  test("segmented presets and toast render in dark mode", async ({ page }) => {
    await test.step("load the hydrated dashboard and switch to dark mode", async () => {
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      await awaitHydratedDashboard(page);

      await page.getByRole("button", { name: "Switch to dark mode" }).click();
      await expect(page.locator("html")).toHaveClass(/dark/);
      await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
    });

    await test.step("the segmented control still toggles under the dark theme", async () => {
      const severeFlare = page
        .getByRole("group", { name: "Quick check-in presets" })
        .getByRole("button", { name: "Severe Flare" });
      await expect(severeFlare).toBeVisible();

      await dismissToastIfVisible(page);
      await severeFlare.click();
      await expect(severeFlare).toHaveAttribute("aria-pressed", "true");
      await expect(glowDot(severeFlare)).toHaveCSS("opacity", "1");
    });

    await test.step("the empathetic toast keeps its glass surface in dark mode", async () => {
      const toast = page.getByRole("alertdialog");
      await expect(toast).toBeVisible();
      // The glassmorphic surface is defined by the backdrop-blur utility on
      // the toast's inner container — assert on the treatment, not on a
      // specific custom class, so styling refactors don't break the check.
      await expect(toast.locator("div[class*='backdrop-blur']")).toBeVisible();
    });
  });

  test("health-logs renders its severity filter or the empty state", async ({ page }) => {
    await test.step("load health logs", async () => {
      await page.goto("/health-logs", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Health Logs" })).toBeVisible();
    });

    const table = page.getByRole("table");
    const emptyState = page.getByText("No logs found");

    // Wait for the async log fetch to settle, then branch: the table (and
    // its severity filter) only renders once logs exist, while the
    // throwaway account starts empty — both branches are legitimate.
    await expect(table.or(emptyState)).toBeVisible();
    if ((await table.count()) === 0) {
      await test.step("no logs yet — the composed empty state is shown", async () => {
        await expect(emptyState).toBeVisible();
      });
      return;
    }

    await test.step("each severity filter narrows the table to its range", async () => {
      const filter = page.getByRole("group", { name: "Filter by pain severity" });
      await expect(filter).toBeVisible();
      const bodyRows = table.locator("tbody tr");

      const buckets = [
        { name: "Low", re: /^([0-3])\/10$/ },
        { name: "Moderate", re: /^([4-6])\/10$/ },
        { name: "Severe", re: /^([7-9]|10)\/10$/ },
      ];

      for (const bucket of buckets) {
        await filter.getByRole("button", { name: bucket.name }).click();
        await expect(filter.getByRole("button", { name: bucket.name })).toHaveAttribute(
          "aria-pressed",
          "true"
        );

        // The table rows are motion.tr elements with 250ms exit animations,
        // so right after a filter change the tbody transiently holds stale
        // rows while old ones exit. Wait for the row count to settle (two
        // consecutive equal reads) before counting — otherwise the loop can
        // query rows that vanish once the exits complete. (-1 = unsettled.)
        await expect
          .poll(async () => {
            const first = await bodyRows.count();
            await page.waitForTimeout(300);
            return (await bodyRows.count()) === first ? first : -1;
          })
          .not.toBe(-1);

        // Either the bucket has rows (every pain cell must fall in range) or
        // the composed empty-filter state is shown (its title is the shared
        // "No matching logs" copy — there is no per-bucket message).
        const noMatches = table.getByText("No matching logs", { exact: true });
        if ((await noMatches.count()) > 0) {
          await expect(noMatches).toBeVisible();
        } else {
          const count = await bodyRows.count();
          expect(count).toBeGreaterThan(0);
          for (let i = 0; i < count; i++) {
            await expect(bodyRows.nth(i).locator("td").nth(1)).toHaveText(bucket.re);
          }
        }
      }
    });
  });

  test("reports page renders its snapshot and insight filter when available", async ({ page }) => {
    await test.step("load reports", async () => {
      await page.goto("/reports", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Medical Reports" })).toBeVisible();
    });

    // The snapshot stats and the insights card render in the same
    // `{!isLoading && snapshot && ...}` fragment, so once the stats are
    // visible the filter-or-locked-state below is already rendered — this
    // assertion is what gates the count() check against the async fetch.
    await expect(page.getByText("Avg Pain · 90 days")).toBeVisible();

    const filter = page.getByRole("group", { name: "Filter insights by severity" });
    if (await filter.count()) {
      await test.step("insights unlocked — the severity filter is interactive", async () => {
        await filter.getByRole("button", { name: "Note" }).click();
        await expect(filter.getByRole("button", { name: "Note" })).toHaveAttribute(
          "aria-pressed",
          "true"
        );
      });
    } else {
      await test.step("fewer than 5 days of logs — the locked-state message is shown", async () => {
        await expect(
          page.getByText("Log at least 5 days of pain + symptoms to unlock personalized insights.")
        ).toBeVisible();
      });
    }
  });
});
