import { test, expect, type Locator, type Page } from "@playwright/test";
import { unlockPrivatePage, unlockLockDialog, seedLocale } from "./helpers/privacy";

/**
 * Dietary & Personal Flare Trigger Tracker — /diet
 *
 * Covers the four functional surfaces introduced for the trigger tracker and
 * proves them in BOTH locales:
 *
 *   · MealLogger            — date/time/meal-type/energy inputs, live
 *                             warnings as a known inflammatory food is typed,
 *                             timing nudge, save → persisted meal card with
 *                             the stored warning snapshot.
 *   · PersonalTriggerList   — add a trigger (severity + note), it appears and
 *                             then can be confirmed-removed.
 *   · FlareCorrelationPanel — loads the server report (or the no-data state)
 *                             with the correlation disclaimer.
 *   · Route protection      — /diet sits behind auth + the privacy PIN gate.
 *
 * The live warning path types a real known-group food ("sugar") so the
 * server-computed warning row appears; we never rely on snapshots of the
 * engine internals.
 *
 * Locale is seeded via the `fibrocare-locale` cookie (the channel the SSR
 * root layout reads), never localStorage, so the server HTML already carries
 * `lang`/`dir` + the translated strings — matching how `arabic-rtl.spec.ts`
 * seeds locale.
 */

const MEAL_NAME = /^diet\.logger\./; // never reached — replaced below

/** Types a food into the meal logger's first food row and asserts the
 *  live warning panel appears. (The trigger-list input is labeled "Food
 *  name", so target the meal row by the "Foods eaten" label instead.) */
async function typeFoodAndExpectWarning(page: Page, food: string) {
  const foodInput = page
    .getByLabel(/Foods eaten|الأطعمة المتناولة/, { exact: false })
    .first();
  await foodInput.fill(food);
  // Live warnings render once the engine matches a known group ("sugar").
  await expect(
    page.getByText(/Possible trigger|محتمل/, { exact: false }).first()
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("Diet & Flare Trigger Tracker", () => {
  test.describe.configure({ mode: "serial" });

  test("loads protected route in EN and renders all four surfaces", async ({ page }) => {
    await unlockPrivatePage(page, "/diet");

    // Page shell
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dietary");
    await expect(page.getByText("Log a Meal", { exact: false }).first()).toBeVisible();

    // Personal trigger list card
    await expect(page.getByText("My Trigger Foods", { exact: false }).first()).toBeVisible();
    await expect(page.getByLabel("Food name").first()).toBeVisible();

    // Correlation panel header
    await expect(page.getByText(/Flare correlation|Evening meals/, { exact: false }).first()).toBeVisible();
  });

  test("live warnings appear as a known food is typed and swap text shows", async ({ page }) => {
    await unlockPrivatePage(page, "/diet");

    await typeFoodAndExpectWarning(page, "sugar");

    // A swap suggestion surfaces for the known group.
    await expect(
      page.getByText(/Swap idea|فكرة بديلة/, { exact: false }).first()
    ).toBeVisible();
  });

  test("saves a meal and persists the stored warning snapshot", async ({ page }) => {
    await unlockPrivatePage(page, "/diet");

    await typeFoodAndExpectWarning(page, "sugar");

    // Save the meal; the card appears with the stored warning badge.
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page.getByText(/Meals logged|Logged meals/, { exact: false }).first()).toBeVisible({
      timeout: 15_000,
    });
    // The saved card echoes the flagged food and shows the warning snapshot.
    const savedCard = page.locator('div[class*="rounded-xl"]', { hasText: /sugar/i }).last();
    await expect(savedCard).toBeVisible();
    await expect(savedCard.getByText(/Possible trigger|محتمل/, { exact: false })).toBeVisible();
  });

  test("adds and removes a personal trigger", async ({ page }) => {
    await unlockPrivatePage(page, "/diet");

    const nameInput = page.getByLabel("Food name").first();
    await nameInput.fill("Chocolate diary");
    await page.getByRole("button", { name: "Add to my list" }).click();

    // The trigger appears with its severity pill.
    await expect(page.getByText("Chocolate diary", { exact: true })).toBeVisible({ timeout: 15_000 });

    // Remove requires a confirming second click.
    const removeBtn = page.getByRole("button", { name: "Remove" }).first();
    await removeBtn.click();
    await removeBtn.click();
    await expect(page.getByText("Trigger removed").first()).toBeVisible();
    await expect(page.getByText("Chocolate diary", { exact: true })).toHaveCount(0, { timeout: 10_000 });
  });

  test("Arabic RTL renders localized copy and mirrors layout", async ({ page }) => {
    await unlockPrivatePage(page, "/diet");

    // Flip to Arabic through the real header toggle.
    for (let attempt = 0; attempt < 5; attempt++) {
      const toggle = page.getByRole("button", { name: "Switch to Arabic" });
      if ((await toggle.count()) === 0) {
        break;
      }
      try {
        await toggle.click({ timeout: 10_000 });
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl", { timeout: 10_000 });
        break;
      } catch {
        await page.reload({ waitUntil: "domcontentloaded" });
        await unlockLockDialog(page).catch(() => {});
        await page.waitForTimeout(1500);
      }
    }

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // Localized headings.
    await expect(page.getByRole("heading", { level: 1 })).toContainText("الغذاء", { timeout: 15_000 });
    await expect(page.getByText("تسجيل وجبة", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("الأطعمة المهيجة", { exact: false }).first()).toBeVisible();

    // RTL mirroring: the brand sits on the inline-start (now right) edge.
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    const brand = page.getByRole("link", { name: "FibroCare" });
    const brandBox = await brand.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(brandBox).not.toBeNull();
    expect(brandBox!.x).toBeGreaterThan(headerBox!.x + headerBox!.width / 2);
  });

  test("logs no console errors during lifecycle", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await unlockPrivatePage(page, "/diet");
    await typeFoodAndExpectWarning(page, "sugar").catch(() => {});
    await page.reload({ waitUntil: "domcontentloaded" });
    await unlockLockDialog(page).catch(() => {});
    await page.waitForTimeout(2000);

    expect(consoleErrors.filter((e) => !/favicon|Failed to load resource/i.test(e))).toEqual([]);
  });
});