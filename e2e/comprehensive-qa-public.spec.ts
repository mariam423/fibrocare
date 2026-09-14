import { test, expect, type Page } from "@playwright/test";

/**
 * Public (unauthenticated) QA — landing page and auth flows.
 * Runs in the "public" project without auth dependency.
 */

/* ─── Helpers ──────────────────────────────────────────────────────── */

/**
 * Click a submit button only after the form is genuinely hydrated.
 *
 * Cold dev-server compiles + React hydration race the first click: a click
 * that lands before hydration triggers a native form submit (full reload),
 * which silently discards client-side validation. Verify hydration by
 * asserting the button is enabled, then drive the click; if the page
 * navigated anyway (native submit), reload and retry.
 */
async function submitWhenHydrated(
  page: Page,
  buttonName: string,
  reloadSelector: string
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const button = page.getByRole("button", { name: buttonName });
    await expect(button).toBeEnabled({ timeout: 20_000 });
    // Hydration gate: wait until React has actually attached to the form
    // subtree (fiber key on the input) before clicking. A pre-hydration
    // click native-submits the form (GET with empty fields), which the
    // URL check below catches — but on a cold dev server that can burn
    // all three retries before React ever mounts. Waiting for the fiber
    // makes the first click land on the real handler.
    try {
      await page.waitForFunction(
        (sel) => {
          const el = document.querySelector(sel);
          return (
            !!el &&
            Object.keys(el).some((k) => k.startsWith("__reactFiber$"))
          );
        },
        reloadSelector,
        { timeout: 30_000 }
      );
    } catch {
      // Fiber probe unavailable (markup change) — fall through; the
      // post-click navigation check below still guards the race.
    }
    await button.click();
    // Hydrated forms never navigate on validation failures. If the URL
    // gains a query string or the form fields disappear, we raced hydration
    // — reload and try again.
    const navigated =
      page.url().includes("?") ||
      !(await page.locator(reloadSelector).isVisible().catch(() => false));
    if (!navigated) return;
    await page.goto(page.url().split("?")[0], {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(reloadSelector, { timeout: 20_000 });
    await page.waitForTimeout(1_000);
  }
}

/** Switch the app to Arabic via the header toggle. The header localizes
 *  its nav aria-label ("Primary navigation" / "التنقل الرئيسي"). */
async function switchToArabic(page: Page) {
  // Wait for the nav to hydrate before checking for the toggle button.
  const nav = page.getByRole("navigation", {
    name: /Primary navigation|التنقل الرئيسي/,
  });
  await expect(nav).toBeVisible({ timeout: 30_000 });

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
      // Re-wait for hydration after reload
      await expect(
        page.getByRole("navigation", { name: /Primary navigation|التنقل الرئيسي/ })
      ).toBeVisible({ timeout: 30_000 });
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

    const nav = page.getByRole("navigation", {
      name: /Primary navigation|التنقل الرئيسي/,
    });
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
    await page.waitForSelector("#email", { timeout: 20_000 });

    await submitWhenHydrated(page, "Sign in", "#email");
    await expect(
      page.getByText("Please enter your email and password.")
    ).toBeVisible({ timeout: 10_000 });
  });

  test("signup validates name required", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#name", { timeout: 20_000 });

    await submitWhenHydrated(page, "Create account", "#name");
    await expect(page.getByText("Please enter your name.")).toBeVisible({ timeout: 10_000 });
  });

  test("signup validates password mismatch", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#name", { timeout: 20_000 });

    // On a cold dev-server compile, hydration can land mid-fill and wipe
    // the inputs — the submit then fires the name-required path instead
    // of the mismatch path (mirrors auth.setup.ts's fillAndVerify race).
    // Fill, verify, AND submit inside one loop: if the fields were wiped
    // between verification and the click (or the alert surfaced the
    // name-required path), reset and retry from a clean load.
    const fields: Array<[string, string]> = [
      ["#name", "Test User"],
      ["#email", "test@example.com"],
      ["#password", "password123"],
      ["#confirm-password", "differentpassword"],
    ];
    for (let attempt = 0; attempt < 4; attempt++) {
      for (const [selector, value] of fields) {
        await page.locator(selector).fill(value);
      }
      try {
        for (const [selector, value] of fields) {
          await expect(page.locator(selector)).toHaveValue(value, { timeout: 5_000 });
        }
      } catch {
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector("#name", { timeout: 20_000 });
        continue;
      }

      await page.getByRole("button", { name: "Create account" }).click();
      try {
        await expect(page.getByText("Passwords do not match.")).toBeVisible({
          timeout: 5_000,
        });
        return;
      } catch {
        // Wrong validation path (fields wiped before the click landed) —
        // reset and try again.
        await page.goto("/signup", { waitUntil: "domcontentloaded" });
        await page.waitForSelector("#name", { timeout: 20_000 });
      }
    }
    throw new Error(
      "Signup never reached the password-mismatch validation path"
    );
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
    const nav = page.getByRole("navigation", {
      name: /Primary navigation|التنقل الرئيسي/,
    });
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
