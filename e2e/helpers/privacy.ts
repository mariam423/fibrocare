import { expect, type Page } from "@playwright/test";

/**
 * Privacy-lock (PIN) gate handling for authenticated e2e specs.
 *
 * The PrivacyGate (`src/components/auth/PrivacyLock.tsx`) covers every
 * non-public route and starts LOCKED in every fresh browser context:
 *
 *   - no stored PIN  → first-run "Set a privacy PIN" setup dialog
 *   - stored PIN set → "Enter your PIN to unlock FibroCare" lock screen
 *
 * The PIN lives in localStorage (not part of Playwright storageState), and
 * the gate RE-LOCKS on every full page load/reload, so specs must seed the
 * PIN per context via addInitScript and unlock through the real keypad
 * after each navigation. This helper centralizes that behavior with a
 * well-known test PIN ("1234"; the hash below is sha256("fibrocare::1234")
 * exactly as the app computes it).
 */

export const TEST_PIN_HASH =
  "208afe2b4d6e78c8377d28a9ef6d8f3905268c53e19ff9f8c99a6b00d73fd1b2";

const LOCK_DIALOG_NAME = "Enter your PIN to unlock FibroCare";

/** Seeds the known test PIN before any app script runs. */
export async function seedPrivacyPin(page: Page): Promise<void> {
  await page.addInitScript((hash) => {
    window.localStorage.setItem("fibrocare-privacy-pin", hash);
  }, TEST_PIN_HASH);
}

/** Waits for the lock screen and unlocks through the real keypad. */
export async function unlockLockDialog(page: Page): Promise<void> {
  const lockDialog = page.getByRole("dialog", { name: LOCK_DIALOG_NAME });
  await expect(lockDialog).toBeVisible({ timeout: 20_000 });

  for (const digit of ["1", "2", "3", "4"]) {
    await lockDialog.getByRole("button", { name: `Digit ${digit}` }).click();
  }
  await expect(lockDialog).toHaveCount(0, { timeout: 10_000 });
}

/**
 * Navigates to `target` and unlocks the privacy gate. Safe to call again
 * after any full page load — each load re-locks. (Init scripts persist
 * across navigations, so the seed only needs to happen once per page.)
 */
export async function unlockPrivatePage(
  page: Page,
  target: string
): Promise<void> {
  await seedPrivacyPin(page);
  await page.goto(target, { waitUntil: "domcontentloaded" });
  await unlockLockDialog(page);
}
