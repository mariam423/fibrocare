import { test as setup, expect } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync } from "node:fs";

const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "FibroCareE2E2026!";
const STORAGE_STATE = "e2e/.auth/user.json";

setup.setTimeout(120_000);

/** True once a session is established: the app root or the authenticated
 *  dashboard landing page (the post-login/signup redirect target — the
 *  dashboard moved from `/` to `/dashboard`, so the bare-root check alone
 *  would never match and the setup would poll until its timeout). */
function isAuthed(url: string) {
  return (
    /^http:\/\/localhost:\d+\/?$/.test(url) ||
    /^http:\/\/localhost:\d+\/dashboard\/?$/.test(url)
  );
}

/**
 * Fills a form and verifies the value actually stuck. On this dev server
 * (cold compiles + React hydration), a fill can race the client re-render
 * and get wiped — so we assert with toHaveValue and retry once with a
 * fresh page load before giving up on that login attempt.
 */
async function fillAndVerify(
  page: import("@playwright/test").Page,
  fields: Array<[selector: string, value: string]>
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const [selector, value] of fields) {
      await page.locator(selector).fill(value);
    }
    try {
      for (const [selector, value] of fields) {
        await expect(page.locator(selector)).toHaveValue(value, { timeout: 5000 });
      }
      return true; // all fills stuck
    } catch {
      // React re-render wiped the input mid-fill — reload and retry.
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForSelector(fields[0][0], { timeout: 20_000 });
      await page.waitForTimeout(1500);
    }
  }
  return false;
}

/**
 * Waits until either the app root is reached or a visible selector appears,
 * returning "root" or "error". Never throws on timeout — the caller decides.
 */
async function waitForOutcome(
  page: import("@playwright/test").Page,
  errorSelector: string,
  deadlineMs: number
): Promise<"root" | "error" | "timeout"> {
  const deadline = Date.now() + deadlineMs;
  while (Date.now() < deadline) {
    if (isAuthed(page.url())) return "root";
    const err = page.locator(errorSelector);
    if ((await err.count()) && (await err.isVisible())) return "error";
    await page.waitForTimeout(300);
  }
  return "timeout";
}

/**
 * Creates the throwaway E2E account (first run) or signs in (later runs),
 * then saves the authenticated session for the smoke tests.
 *
 * Mirrors the project's a11y audit: try sign-up first; if the account
 * already exists (or sign-up fails to navigate), fall back to sign-in.
 * Both paths are hardened against the cold-compile + hydration race.
 */
setup("authenticate as throwaway account", async ({ page }) => {
  mkdirSync("e2e/.auth", { recursive: true });

  // Reuse a still-valid state first. This avoids repeating signup/login on
  // every run and makes the setup resilient to slow dev-server compiles.
  if (existsSync(STORAGE_STATE)) {
    try {
      const storedState = JSON.parse(readFileSync(STORAGE_STATE, "utf8"));
      await page.context().addCookies(storedState.cookies ?? []);
      await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
      if (isAuthed(page.url())) {
        await page.context().storageState({ path: STORAGE_STATE });
        return;
      }
      await page.context().clearCookies();
    } catch {
      await page.context().clearCookies();
    }
  }

  // --- Attempt 1: sign-up (creates the account on first run) ------------
  await page.goto("/signup", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#name", { timeout: 20_000 });
  await page.waitForTimeout(1500); // let React hydrate before submitting
  const signupFilled = await fillAndVerify(page, [
    ["#name", "E2E Smoke"],
    ["#email", E2E_EMAIL],
    ["#password", E2E_PASSWORD],
    ["#confirm-password", E2E_PASSWORD],
  ]);
  if (signupFilled) {
    await page.getByRole("button", { name: "Create account" }).click();
  }
  let outcome = await waitForOutcome(page, "#signup-error", 40_000);

  if (outcome !== "root") {
    // --- Attempt 2: sign-in (account already exists on later runs) ------
    for (let attempt = 0; attempt < 4 && outcome !== "root"; attempt++) {
      await page.goto("/login", { waitUntil: "domcontentloaded" });
      await page.waitForSelector("#email", { timeout: 20_000 });
      await page.waitForTimeout(1500);
      const filled = await fillAndVerify(page, [
        ["#email", E2E_EMAIL],
        ["#password", E2E_PASSWORD],
      ]);
      if (!filled) continue; // hydration kept wiping the fields — reload & retry

      // React can wipe the fields between fillAndVerify and the click, which
      // would submit an empty form and fire the client-side validation alert
      // (indistinguishable from a server rejection by selector alone).
      // Re-verify the values are still present immediately before clicking.
      try {
        await expect(page.locator("#email")).toHaveValue(E2E_EMAIL, { timeout: 3000 });
        await expect(page.locator("#password")).toHaveValue(E2E_PASSWORD, { timeout: 3000 });
      } catch {
        continue; // wiped again — retry from a clean load
      }

      await page.getByRole("button", { name: "Sign in" }).click();

      // A native GET submission (React not yet hydrated) leaks the
      // credentials into the URL — detect and retry clean instead of
      // mistaking the redirect for an outcome.
      if (page.url().includes("?email=")) {
        outcome = "timeout";
        continue;
      }

      outcome = await waitForOutcome(page, "#login-error", 30_000);
      if (outcome === "error") {
        // Tell a real server rejection apart from the empty-fields client
        // validation: if the fields are empty, hydration wiped them and the
        // alert is client-side — retry instead of failing.
        const emailVal = await page.locator("#email").inputValue().catch(() => "");
        const passVal = await page.locator("#password").inputValue().catch(() => "");
        if (!emailVal || !passVal) {
          outcome = "timeout";
          continue;
        }
        throw new Error("Sign-in rejected the E2E credentials");
      }
      // "timeout" = transient cold-compile stall; retry from a clean load.
    }
  }

  if (outcome !== "root") {
    throw new Error("Could not authenticate the throwaway E2E account");
  }

  await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/(dashboard)?\/?$/);
  await page.context().storageState({ path: STORAGE_STATE });
});
