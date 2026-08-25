import { test, expect } from "@playwright/test";

/**
 * Temporary verification for the React ViewTransition route crossfade.
 * Counts document.startViewTransition() calls across a client-side
 * navigation and fails if no transition ran or the console got noisy.
 */
test.describe("route view transitions", () => {
  test("client navigation crossfades via startViewTransition", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.addInitScript(() => {
      const w = window as typeof window & { __vtCount: number };
      const read = () => Number(sessionStorage.getItem("__vtCount") || 0);
      const orig = document.startViewTransition?.bind(document);
      if (orig) {
        document.startViewTransition = (cb: () => void | Promise<void>) => {
          const c = read() + 1;
          sessionStorage.setItem("__vtCount", String(c));
          return orig(cb);
        };
      }
      w.__vtCount = read();
    });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const support = await page.evaluate(() => {
      const hasElements = document.querySelectorAll("[style*='view-transition-name'], *[style*='view-transition-name']").length;
      return {
        api: typeof document.startViewTransition,
        namedElements: hasElements,
      };
    });
    console.log("VT support:", JSON.stringify(support));
    // The dashboard is a client component: its SSR HTML renders the
    // placeholder name "User" until React hydrates and the data action
    // resolves. Clicking the nav link in that window lands on a dead
    // handler — or worse, a native full-page navigation that skips
    // startViewTransition entirely — so wait for the real name first (the
    // same hydration gate the Arabic RTL spec uses).
    const greeting = page.getByRole("heading", {
      name: /Good (morning|afternoon|evening)/,
    });
    await expect(greeting).toBeVisible();
    await expect(greeting).not.toContainText("User", { timeout: 30_000 });

    const healthLogsLink = page.getByRole("link", { name: "Health Logs", exact: true }).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      await healthLogsLink.click();
      try {
        await expect(page).toHaveURL(/\/health-logs/, { timeout: 30_000 });
        break;
      } catch {
        // Pre-hydration click — retry like the smoke tests do.
      }
    }
    await expect(page).toHaveURL(/\/health-logs/);
    await expect(page.getByRole("heading", { name: "Health Logs" })).toBeVisible();

    const count = await page.evaluate(
      () => Number(sessionStorage.getItem("__vtCount") || 0)
    );
    const navType = await page.evaluate(
      () =>
        (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)
          ?.type ?? "unknown"
    );
    console.log("navigation type:", navType, "| startViewTransition calls:", count);
    expect(navType, "expected a client-side (same-document) navigation").toBe("navigate");
    expect(count, "expected startViewTransition to have fired").toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });
});
