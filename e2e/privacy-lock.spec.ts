import { test, expect, type Locator } from "@playwright/test";
import { createHash } from "node:crypto";

/**
 * PIN privacy lock — verifies the lock screen renders the signed-in user's
 * identity and that its text is crisp (no blur filter, full opacity).
 *
 * The app hashes PINs as sha256(`fibrocare::${pin}`) before storing them in
 * localStorage under `fibrocare-privacy-pin` (see PrivacyLock.tsx), so we seed
 * the same value before any app script runs and navigate to a protected route.
 */

const PIN = "1234";
const PIN_HASH = createHash("sha256").update(`fibrocare::${PIN}`).digest("hex");
// Mirrors auth.setup.ts: the throwaway account created for authenticated runs.
const USER_NAME = "E2E Smoke";
const USER_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";

/**
 * Asserts an element — and every ancestor up to <html> — is neither blurred by
 * a `filter` nor faded below full opacity. (An ancestor's `backdrop-filter`
 * only blurs what's *behind* it, so it can't smear its own text and is
 * deliberately not treated as a blur source here.)
 */
async function expectCrispText(
  locator: Locator,
  { allowDimmed = false }: { allowDimmed?: boolean } = {}
) {
  await expect
    .poll(
      () =>
        locator.evaluate((el, allowDimmed) => {
          let node: HTMLElement | null = el as HTMLElement;
          while (node) {
            const style = getComputedStyle(node);
            if (style.filter && style.filter !== "none") return false;
            if (!allowDimmed && style.opacity && Number(style.opacity) < 1) return false;
            node = node.parentElement;
          }
          return true;
        }, allowDimmed),
      {
        timeout: 20_000,
        message:
          "text should be crisp (no blur filter, full opacity) on the element and its ancestors",
      }
    )
    .toBe(true);
}

test.describe("PIN lock screen", () => {
  test("renders the user identity and sharp, unblurred text", async ({ page }) => {
    // Seed the stored PIN before the app's scripts run so the client sees a
    // configured lock and gates the dashboard on hydration.
    await page.addInitScript((hash) => {
      window.localStorage.setItem("fibrocare-privacy-pin", hash);
    }, PIN_HASH);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // The gate replaces the dashboard with the lock overlay once the client
    // reads the stored PIN.
    const title = page.getByRole("heading", { name: "Your space is locked" });
    await expect(title).toBeVisible();

    // Signed-in identity header rendered above the title.
    const name = page.getByText(USER_NAME, { exact: true });
    await expect(name).toBeVisible();
    const email = page.getByText(USER_EMAIL, { exact: true });
    await expect(email).toBeVisible();

    // Key lock-screen text must be sharp, not blurred/faded by a parent.
    await expectCrispText(title);
    await expectCrispText(name);
    await expectCrispText(email);
    await expectCrispText(page.getByText("Forgot PIN?", { exact: true }));
    await expectCrispText(
      page.getByRole("button", { name: "Use device biometrics", exact: true })
    );
    await expectCrispText(page.getByRole("button", { name: "Digit 1" }));
  });

  test("Forgot PIN opens the recovery modal and lets a signed-in user reset the PIN", async ({
    page,
  }) => {
    await page.addInitScript((hash) => {
      window.localStorage.setItem("fibrocare-privacy-pin", hash);
    }, PIN_HASH);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { name: "Your space is locked" });
    await expect(title).toBeVisible();

    // "Forgot PIN?" must open the recovery modal, not sit dead.
    await page.getByText("Forgot PIN?", { exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Reset your privacy PIN" });
    await expect(modal).toBeVisible();

    // The signed-in session is the recovery gate: the reset form shows
    // directly (instead of a dead click or a dead-end prompt).
    await expect(modal.getByText("New PIN", { exact: true })).toBeVisible();
    await expect(modal.getByText("Confirm PIN", { exact: true })).toBeVisible();

    // Enter a matching new PIN and confirm — the app unlocks immediately.
    await modal.locator("#reset-pin").fill("5678");
    await modal.locator("#reset-pin-confirm").fill("5678");
    await modal.getByRole("button", { name: "Reset PIN" }).click();

    await expect(title).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /Good (morning|afternoon|evening)/ })
    ).toBeVisible();
  });

  test("Use Biometrics shows a helpful fallback alert when not supported or configured", async ({
    page,
  }) => {
    await page.addInitScript((hash) => {
      window.localStorage.setItem("fibrocare-privacy-pin", hash);
    }, PIN_HASH);

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { name: "Your space is locked" });
    await expect(title).toBeVisible();

    // Headless Chrome has no platform authenticator (and no enrolled
    // credential), so the button must surface a clear alert rather than fail
    // silently.
    await page
      .getByRole("button", { name: "Use device biometrics", exact: true })
      .click();
    await expect(
      page.getByText(
        "Biometric authentication is not supported or set up on this device.",
        { exact: true }
      )
    ).toBeVisible();

    // The lock screen is still usable — the PIN keypad remains.
    await expect(page.getByRole("button", { name: "Digit 1" })).toBeVisible();
  });
});

test.describe("PIN setup (profile)", () => {
  test("privacy lock setup card renders sharp text", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" });

    // The profile page awaits several server actions before rendering its
    // cards; the "Privacy Lock" card is the live PIN setup surface. A fresh
    // context has no stored PIN, so it shows the "Enable Lock" setup form.
    const cardTitle = page.getByText("Privacy Lock", { exact: true });
    await expect(cardTitle).toBeVisible();

    const newPinLabel = page.getByText("New 4-digit PIN", { exact: true });
    await expect(newPinLabel).toBeVisible();
    const enableButton = page.getByRole("button", { name: "Enable Lock" });
    await expect(enableButton).toBeVisible();
    const description = page.getByText(
      "Protect your sensitive health data with a 4-digit PIN.",
      { exact: true }
    );
    await expect(description).toBeVisible();

    // Setup text must be crisp — no blur filter, no faded opacity.
    await expectCrispText(cardTitle);
    await expectCrispText(newPinLabel);
    // The "Enable Lock" button is disabled until a 4-digit PIN is entered, so
    // its dimmed opacity is intentional — only assert it has no blur filter.
    await expectCrispText(enableButton, { allowDimmed: true });
    await expectCrispText(description);
  });
});
