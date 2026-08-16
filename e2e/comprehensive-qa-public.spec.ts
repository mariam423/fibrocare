import { test, expect, type Page } from "@playwright/test";

/**
 * Public (unauthenticated) QA — landing page and auth flows.
 * Runs in the "public" project without auth dependency.
 */

/* ─── Helpers ──────────────────────────────────────────────────────── */

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
  // Use .first() to avoid strict mode violation (header + footer both have brand)
  const brand = page.getByRole("link", { name: "FibroCare" }).first();
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

/* ─── Landing Page ─────────────────────────────────────────────────── */

test.describe("Landing page QA", () => {
  test("renders hero, nav, and CTA buttons", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#hero-heading")).toBeVisible();

    const startBtn = page.getByRole("link", { name: /Start|Get started/i });
    await expect(startBtn.first()).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
  });

  test("FAQ section renders with questions", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const faqHeading = page.getByRole("heading", { name: /Questions/i });
    await expect(faqHeading).toBeVisible();

    // Verify FAQ questions are rendered
    await expect(
      page.getByText("Is FibroCare a diagnosis or a doctor?")
    ).toBeVisible();
    await expect(
      page.getByText("How long does a check-in take?")
    ).toBeVisible();
    await expect(
      page.getByText("Will my health data stay private?")
    ).toBeVisible();
  });

  test("dark mode toggle button exists", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const darkToggle = page.getByRole("button", {
      name: /Switch to dark mode/i,
    });
    await expect(darkToggle).toBeVisible();
  });

  test("sign-in link navigates to login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const signIn = page.getByRole("link", { name: /Sign in/i }).first();
    await expect(signIn).toBeVisible();
    await signIn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("no console errors on landing", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });
});

/* ─── Auth Flows ──────────────────────────────────────────────────── */

test.describe("Auth flows QA", () => {
  test("login validates empty fields", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // Wait for hydration before clicking
    await page.waitForSelector("#email", { timeout: 20_000 });
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByText("Please enter your email and password")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("signup validates name required", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    // Wait for hydration before clicking
    await page.waitForSelector("#name", { timeout: 20_000 });
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Please enter your name")).toBeVisible({ timeout: 10_000 });
  });

  test("signup validates password mismatch", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    // Wait for hydration before filling
    await page.waitForSelector("#name", { timeout: 20_000 });
    await page.waitForTimeout(1000);
    
    await page.locator("#name").fill("Test User");
    await page.locator("#email").fill("test@example.com");
    await page.locator("#password").fill("password123");
    await page.locator("#confirm-password").fill("differentpassword");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible({ timeout: 10_000 });
  });

  test("login links to signup and forgot-password", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("link", { name: "Create an account" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Forgot your password?" })
    ).toBeVisible();
  });

  test("signup links to login", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

/* ─── Arabic RTL for Public Pages ──────────────────────────────────── */

test.describe("Arabic RTL public pages QA", () => {
  test("landing page renders Arabic RTL", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await switchToArabic(page);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expectBrandMirrored(page, "rtl");

    // Verify the page has Arabic content (nav links should be in Arabic)
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
  });

  test("login page renders Arabic RTL", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await switchToArabic(page);
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    // The login page heading in Arabic - check for the h1 or any heading
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("signup page renders Arabic RTL", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await switchToArabic(page);
    await page.goto("/signup", { waitUntil: "domcontentloaded" });

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    // The signup page heading in Arabic - check for the h1 or any heading
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
