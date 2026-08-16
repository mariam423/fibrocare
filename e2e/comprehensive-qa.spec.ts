import { test, expect, type Page } from "@playwright/test";

/**
 * Authenticated QA — dashboard, health logs, resources, profile, reports, zen.
 * Runs in the "chromium" project with auth dependency.
 */

/* ─── Helpers ──────────────────────────────────────────────────────── */

/** Wait until the dashboard is fully hydrated (greeting shows real name). */
async function awaitHydratedDashboard(page: Page) {
  const greeting = page.getByRole("heading", {
    name: /Good (morning|afternoon|evening)/,
  });
  await expect(greeting).toBeVisible();
  await expect(greeting).not.toContainText("User", { timeout: 30_000 });
}

/** Dismiss any auto-shown flare toast so the test controls timing. */
async function dismissToastIfVisible(page: Page) {
  const toast = page.getByRole("alertdialog");
  if ((await toast.count()) > 0) {
    await page
      .getByRole("button", { name: "Dismiss message" })
      .click({ timeout: 5000 })
      .catch(() => {});
    await expect(toast).not.toBeVisible({ timeout: 5000 }).catch(() => {});
  }
}

/** Switch the app to Arabic via the header toggle. */
async function switchToArabic(page: Page) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const toggle = page.getByRole("button", { name: "Switch to Arabic" });
    if ((await toggle.count()) === 0) {
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      return;
    }
    try {
      await toggle.click({ timeout: 10_000 });
    } catch {
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      continue;
    }
    try {
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl", {
        timeout: 10_000,
      });
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      return;
    } catch {
      // hydration race — retry
    }
  }
  throw new Error("Could not switch the app to Arabic");
}

/** Assert the header brand sits on the correct inline-start edge. */
async function expectBrandMirrored(page: Page, dir: "ltr" | "rtl") {
  const header = page.locator("header").first();
  await expect(header).toBeVisible();
  const headerBox = await header.boundingBox();
  const brand = page.getByRole("link", { name: "FibroCare" });
  await expect(brand).toBeVisible();
  const brandBox = await brand.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(brandBox).not.toBeNull();
  const midX = headerBox!.x + headerBox!.width / 2;
  if (dir === "rtl") {
    expect(brandBox!.x).toBeGreaterThan(midX);
  } else {
    expect(brandBox!.x).toBeLessThan(midX);
  }
}

/* ─── Dashboard ────────────────────────────────────────────────────── */

test.describe("Dashboard QA", () => {
  test("renders greeting, check-in presets, and gentle support", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);

    const greeting = page.getByRole("heading", {
      name: /Good (morning|afternoon|evening)/,
    });
    await expect(greeting).toBeVisible();
    await expect(greeting).not.toContainText("User");

    const presets = page.getByRole("group", {
      name: "Quick check-in presets",
    });
    await expect(presets).toBeVisible();
    await expect(
      presets.getByRole("button", { name: "Calm Day" })
    ).toBeVisible();
    await expect(
      presets.getByRole("button", { name: "Severe Flare" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Gentle Support" })
    ).toBeVisible();
  });

  test("preset toggle works with glow indicator", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);
    await dismissToastIfVisible(page);

    const presets = page.getByRole("group", {
      name: "Quick check-in presets",
    });
    const severe = presets.getByRole("button", { name: "Severe Flare" });

    await severe.click();
    await expect(severe).toHaveAttribute("aria-pressed", "true");
    await expect(
      presets.getByRole("button", { name: "Calm Day" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("gratitude journal saves entry", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);

    const textarea = page.locator("#gratitude-input");
    await expect(textarea).toBeVisible();
    await textarea.fill("I am grateful for a peaceful morning.");
    await page.getByRole("button", { name: "Save Entry" }).click();
    await expect(page.getByRole("button", { name: "Saved ✓" })).toBeVisible();
  });

  test("sensitive mode toggles", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);
    await dismissToastIfVisible(page);

    for (let attempt = 0; attempt < 3; attempt++) {
      await dismissToastIfVisible(page);
      await page
        .getByRole("button", { name: "Activate Sensitive Mode" })
        .click({ timeout: 10_000 })
        .catch(() => {});
      try {
        await expect(
          page.getByRole("button", {
            name: "Deactivate Sensitive Mode",
          })
        ).toBeVisible({ timeout: 10_000 });
        break;
      } catch {
        // not hydrated yet
      }
    }
    await expect(
      page.getByRole("button", { name: "Deactivate Sensitive Mode" })
    ).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);

    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("zen portal navigation works", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);

    for (let attempt = 0; attempt < 3; attempt++) {
      await page
        .getByRole("button", { name: "Open Zen Portal" })
        .click();
      try {
        await expect(page).toHaveURL(/\/zen/, { timeout: 30_000 });
        break;
      } catch {
        // not hydrated yet
      }
    }
    await expect(page).toHaveURL(/\/zen/);
    await expect(
      page.getByText("Focus on your breath", { exact: true })
    ).toBeVisible();
  });
});

/* ─── Health Logs ─────────────────────────────────────────────────── */

test.describe("Health Logs QA", () => {
  test("renders heading and table or empty state", async ({ page }) => {
    await page.goto("/health-logs", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Health Logs" })
    ).toBeVisible();

    const table = page.getByRole("table");
    const emptyState = page.getByText("No logs found");
    await expect(table.or(emptyState)).toBeVisible();
  });
});

/* ─── Resources ───────────────────────────────────────────────────── */

test.describe("Resources QA", () => {
  test("renders with category filters", async ({ page }) => {
    await page.goto("/resources", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Care Resources", level: 1 })
    ).toBeVisible();

    const allBtn = page.getByRole("button", { name: "All", exact: true });
    await expect(allBtn).toBeVisible();
    await expect(allBtn).toHaveAttribute("aria-pressed", "true");
  });
});

/* ─── Profile ─────────────────────────────────────────────────────── */

test.describe("Profile QA", () => {
  test("renders heading and settings sections", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Profile/i })).toBeVisible({
      timeout: 60_000,
    });

    await expect(page.getByText("Account Settings")).toBeVisible();
    await expect(page.getByText("Motion & Comfort")).toBeVisible();
  });
});

/* ─── Reports ─────────────────────────────────────────────────────── */

test.describe("Reports QA", () => {
  test("renders heading and snapshot stats", async ({ page }) => {
    await page.goto("/reports", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Medical Reports", level: 1 })
    ).toBeVisible();
    await expect(page.getByText("Avg Pain · 90 days")).toBeVisible();
  });
});

/* ─── Zen Portal ──────────────────────────────────────────────────── */

test.describe("Zen Portal QA", () => {
  test("renders breathing bubble and soundscape", async ({ page }) => {
    await page.goto("/zen", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("button", { name: "Back to Dashboard" })
    ).toBeVisible();
    await expect(
      page.getByText("Breathe in").or(page.getByText("Breathe out"))
    ).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Ambient Sound Mixer" })
    ).toBeVisible();
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/zen", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: "Ultra dark" })).toBeVisible();
    await page.getByRole("button", { name: "Ultra dark" }).click();
    await expect(
      page.getByRole("button", { name: "Exit dark mode" })
    ).toBeVisible();
  });
});

/* ─── Arabic RTL for Authenticated Pages ──────────────────────────── */

test.describe("Arabic RTL authenticated pages QA", () => {
  test("dashboard renders Arabic RTL", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);
    await switchToArabic(page);

    await expect(
      page.getByRole("heading", { name: "رؤية الرعاية بالذكاء الاصطناعي" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "دعم لطيف" })).toBeVisible();
    await expectBrandMirrored(page, "rtl");
  });

  test("health logs renders Arabic RTL", async ({ page }) => {
    await page.goto("/health-logs", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Health Logs" })
    ).toBeVisible();
    await switchToArabic(page);

    await expect(
      page.getByRole("heading", { name: "سجلات الصحة" })
    ).toBeVisible();
    await expectBrandMirrored(page, "rtl");
  });

  test("resources renders Arabic RTL", async ({ page }) => {
    await page.goto("/resources", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Care Resources", level: 1 })
    ).toBeVisible();
    await switchToArabic(page);

    await expect(
      page.getByRole("heading", { name: "موارد الرعاية", level: 1 })
    ).toBeVisible();
    await expectBrandMirrored(page, "rtl");
  });

  test("profile renders Arabic RTL", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /Profile/i })).toBeVisible({
      timeout: 60_000,
    });
    await switchToArabic(page);

    await expect(
      page.getByRole("heading", { name: "الملف الشخصي", level: 1 })
    ).toBeVisible();
    await expectBrandMirrored(page, "rtl");
  });

  test("reports renders Arabic RTL", async ({ page }) => {
    await page.goto("/reports", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Medical Reports", level: 1 })
    ).toBeVisible();
    await switchToArabic(page);

    await expect(
      page.getByRole("heading", { name: "التقارير الطبية", level: 1 })
    ).toBeVisible();
    await expectBrandMirrored(page, "rtl");
  });

  test("zen portal renders Arabic RTL", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await awaitHydratedDashboard(page);
    await switchToArabic(page);

    await page.goto("/zen", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(
      page.getByRole("button", { name: "العودة للوحة التحكم" })
    ).toBeVisible();
  });
});
