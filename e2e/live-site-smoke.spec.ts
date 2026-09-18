import { test, expect, type Page } from "@playwright/test";

/**
 * LIVE-SITE SMOKE TESTS — https://fibrocare.vercel.app (read-only).
 *
 * Runs against the REAL production deployment. Ground rules:
 *  - NO account creation, NO logins with real credentials, NO data writes.
 *    Every test below either asserts public-page rendering, client-side
 *    validation errors (never reach the server), or auth-wall redirects.
 *  - The signup "real submission" path is exercised with a throwaway
 *    example.com address that CANNOT receive the account (fake domain)
 *    AND is expected to be rejected client-side (password mismatch), so
 *    `registerUser` is never actually invoked — the test asserts the
 *    mismatch alert, proving hydration + validation work live.
 *  - Credentials-login is exercised ONLY with a deliberately invalid
 *    password for a nonexistent mailbox, asserting the generic 401
 *    message (which also proves the login-existence-oracle protection).
 *
 * Config: playwright.live-site.config.ts (baseURL = production, no
 * webServer, service workers blocked for determinism).
 */

const VALIDATION_TIMEOUT = 15_000;

/**
 * Hydration gate for the live site: wait until React has attached to the
 * form field before clicking submit, so client-side validation (not a
 * native form GET) handles the click. Mirrors the local-suite
 * `submitWhenHydrated` helper without the dev-server reload retries —
 * production is precompiled, so one short wait suffices.
 */
async function waitForHydration(page: Page, selector: string) {
  await page.waitForSelector(selector, { timeout: 20_000 });
  await page
    .waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return !!el && Object.keys(el).some((k) => k.startsWith("__reactFiber$"));
      },
      selector,
      { timeout: 20_000 }
    )
    .catch(() => {
      // Fiber probe is a best-effort gate; the assertions below still
      // verify the correct validation path fired.
    });
}

test.describe("Live landing → auth navigation", () => {
  test("landing page renders and links to login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.locator("h1").first()).toBeVisible({
      timeout: VALIDATION_TIMEOUT,
    });

    const signIn = page.getByRole("link", { name: /Sign in|تسجيل الدخول/i }).first();
    await expect(signIn).toBeVisible();
    await signIn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page shows both email/password fields and links", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Create an account|إنشاء حساب/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Forgot your password|نسيت كلمة/i })
    ).toBeVisible();
  });
});

test.describe("Live login flow", () => {
  test("empty submit shows the client-side validation message", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForHydration(page, "#email");

    await page.getByRole("button", { name: /Sign in|تسجيل الدخول/i }).click();

    await expect(
      page.getByText(/Please enter your email and password|أدخل البريد الإلكتروني وكلمة المرور/i)
    ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
    // Client-side validation: still on /login, no navigation happened.
    await expect(page).toHaveURL(/\/login/);
  });

  test("invalid credentials get the generic rejection (no existence oracle)", async ({
    page,
  }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await waitForHydration(page, "#email");

    await page.locator("#email").fill("nobody.invalid@example.com");
    await page.locator("#password").fill("definitely-not-a-real-password-9f3a");
    await page.getByRole("button", { name: /Sign in|تسجيل الدخول/i }).click();

    // The generic message must be identical for unknown-email vs
    // wrong-password (brute-force/enum protection, see src/lib/auth.ts).
    await expect(
      page.getByText(/Incorrect email or password|البريد الإلكتروني أو كلمة المرور غير صحيحة/i)
    ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Live signup flow", () => {
  test("empty submit shows the name-required validation", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await waitForHydration(page, "#name");

    await page.getByRole("button", { name: /Create account|إنشاء حساب/i }).click();

    await expect(
      page.getByText(/Please enter your name|أدخل اسمك/i)
    ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
    await expect(page).toHaveURL(/\/signup/);
  });

  test("password mismatch is caught client-side (no account is created)", async ({
    page,
  }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await waitForHydration(page, "#name");

    // Throwaway values on a reserved example domain; the mismatch fires
    // BEFORE the server action, so `registerUser` is never reached.
    await page.locator("#name").fill("Live Smoke Probe");
    await page.locator("#email").fill("live-smoke.reject@example.com");
    await page.locator("#password").fill("LiveSmokeProbe2026!");
    await page.locator("#confirm-password").fill("DifferentValue2026!");
    await page.getByRole("button", { name: /Create account|إنشاء حساب/i }).click();

    await expect(
      page.getByText(/Passwords do not match|كلمتا المرور غير متطابقتين/i)
    ).toBeVisible({ timeout: VALIDATION_TIMEOUT });
    await expect(page).toHaveURL(/\/signup/);
  });

  test("short password is caught client-side", async ({ page }) => {
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    await waitForHydration(page, "#name");

    await page.locator("#name").fill("Live Smoke Probe");
    await page.locator("#email").fill("live-smoke.shortpw@example.com");
    await page.locator("#password").fill("short");
    await page.locator("#confirm-password").fill("short");
    await page.getByRole("button", { name: /Create account|إنشاء حساب/i }).click();

    // Target the alert role specifically — the static password hint below
    // the field also contains "8 characters" and would trip strict mode.
    // (The alert's accessible name IS its text content — but Playwright's
    // name option on role=alert is unreliable across engines, so match the
    // element by role + assert its text.)
    const shortPwAlert = page.getByRole("alert").filter({
      hasText: /at least 8 characters|8 أحرف على الأقل/i,
    });
    await expect(shortPwAlert).toBeVisible({ timeout: VALIDATION_TIMEOUT });
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe("Live auth wall", () => {
  test("protected route redirects anonymous visitors to login", async ({ page }) => {
    // Fresh context (no session cookie): the middleware must bounce
    // /dashboard to /login with a callbackUrl param — the fail-closed
    // route guard, verified live.
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/login/, { timeout: VALIDATION_TIMEOUT });
    await expect(page.locator("#email")).toBeVisible();
  });

  test("forged session cookie is rejected (fail-closed middleware)", async ({ page }) => {
    // Set a bogus session token before any navigation: the middleware's
    // getToken verification must reject it and land on /login — NOT serve
    // the protected page shell (the historical fail-open bug).
    //
    // NOTE: the redirect here comes from path 3 ("no valid session") —
    // next-auth's getToken swallows decryption errors and returns null, so
    // the cookie-clearing catch path never fires for a forged token. The
    // security property under test is that the protected page is NEVER
    // served, which the URL + missing dashboard content assert.
    await page.context().addCookies([
      {
        name: "next-auth.session-token",
        value: "forged-token-value-must-be-rejected",
        url: "https://fibrocare.vercel.app",
      },
    ]);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/login/, { timeout: VALIDATION_TIMEOUT });
    // The dashboard UI must not have rendered in any shape: no greeting
    // heading, no dashboard content behind the redirect.
    await expect(
      page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })
    ).toHaveCount(0);
    await expect(page.locator("#email")).toBeVisible();
  });
});
