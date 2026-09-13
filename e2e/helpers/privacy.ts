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

/** The lock dialog's accessible name in both locales (translations.ts). */
const LOCK_DIALOG_NAME = "Enter your PIN to unlock FibroCare";
const LOCK_DIALOG_NAME_AR = "أدخل رمز PIN لفتح FibroCare";

/**
 * How long to wait for the privacy lock dialog to appear after a navigation.
 *
 * Generous on purpose: in CI, the first navigation to a route forces a cold
 * compile of every server component in that subtree, and the lock screen
 * is rendered by the same React tree the test is exercising. 20s was
 * empirically too tight when running multiple specs in a single `npm run
 * e2e` invocation on a fresh `next dev` — 60s keeps the spec stable
 * without slowing down the common (warm) case.
 */
const LOCK_DIALOG_TIMEOUT_MS = 60_000;

/** Seeds the known test PIN before any app script runs. */
export async function seedPrivacyPin(page: Page): Promise<void> {
  await page.addInitScript((hash) => {
    window.localStorage.setItem("fibrocare-privacy-pin", hash);
  }, TEST_PIN_HASH);
}

/**
 * Lock-dialog locator, tolerant of the active locale.
 *
 * `getByRole("dialog", { name })` matches by accessible name; the name is
 * a regex so either locale's dialog matches without knowing which is up.
 */
export function lockDialog(page: Page) {
  return page
    .getByRole("dialog", { name: new RegExp(`${LOCK_DIALOG_NAME}|${LOCK_DIALOG_NAME_AR}`) })
    .first();
}

/**
 * Waits for the lock screen and unlocks through the real keypad.
 *
 * Digit buttons expose `privacy.digitAria` ("Digit N" / "الرقم N"); both
 * label shapes are tried so a partially-localized page still unlocks.
 */
export async function unlockLockDialog(page: Page): Promise<void> {
  const dialog = lockDialog(page);
  await expect(dialog).toBeVisible({ timeout: LOCK_DIALOG_TIMEOUT_MS });

  for (const digit of ["1", "2", "3", "4"]) {
    const byEn = dialog.getByRole("button", { name: `Digit ${digit}` });
    const byAr = dialog.getByRole("button", { name: `الرقم ${digit}` });
    if (await byEn.count()) {
      await byEn.first().click();
    } else {
      await byAr.first().click();
    }
  }
  await expect(dialog).toHaveCount(0, { timeout: LOCK_DIALOG_TIMEOUT_MS });
}

/**
 * Waits out the first-run PIN-setup dialog without configuring a PIN.
 *
 * The setup flow ("Set a privacy PIN" / "تعيين رمز PIN للخصوصية") appears
 * in contexts whose localStorage has no `fibrocare-privacy-pin` yet — a
 * plain `page.goto` without the seed, or a context created before the seed
 * ran. Two exits, both deterministic:
 *
 *   1. "Use Biometrics" (البيومترية) — calls the same `unlock()` the
 *      keypad's success path calls, with no PIN entry. Locale-independent
 *      and instant.
 *   2. Dismissing the dialog if it offers a close/later control.
 *
 * After unlocking through setup, the app renders normally. The PIN stays
 * unseeded, so subsequent full page loads re-enter setup — the caller
 * should re-seed + re-unlock after any reload (same contract as the lock).
 */
export async function skipSetupDialog(page: Page): Promise<void> {
  const setup = page
    .getByRole("dialog", { name: /Set a privacy PIN|تعيين رمز PIN للخصوصية/ })
    .first();
  try {
    await expect(setup).toBeVisible({ timeout: 10_000 });
  } catch {
    return; // no setup dialog within the window — nothing to skip
  }
  const biometrics = setup.getByRole("button", {
    name: /Use Biometrics|استخدام البصمة/,
  });
  if (await biometrics.count()) {
    await biometrics.first().click();
  } else {
    // No biometrics escape hatch: seed the PIN and reload, which re-enters
    // the lock dialog with the well-known hash in place.
    await seedPrivacyPin(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await unlockLockDialog(page);
    return;
  }
  await expect(setup).toHaveCount(0, { timeout: LOCK_DIALOG_TIMEOUT_MS });
}

/** True when either privacy dialog currently covers the page. */
async function privacyDialogVisible(page: Page): Promise<boolean> {
  const gate = page
    .locator('[role="dialog"]')
    .filter({ hasText: /PIN|الرقم|رمز PIN/ })
    .first();
  return (await gate.count()) > 0 && (await gate.isVisible());
}

/**
 * Navigates to `target` and unlocks the privacy gate, whatever state it
 * presents: lock dialog (seeded PIN), setup dialog (unseeded context), or
 * already-unlocked. Safe to call again after any full page load — each
 * load re-locks. (Init scripts persist across navigations, so the seed
 * only needs to happen once per page.)
 */
export async function unlockPrivatePage(
  page: Page,
  target: string
): Promise<void> {
  await seedPrivacyPin(page);
  await page.goto(target, { waitUntil: "domcontentloaded" });

  // A context may have loaded the route before the seed applied (or a
  // spec may navigate before calling this helper), leaving the setup
  // dialog up — settle it first.
  await skipSetupDialog(page);
  if (!(await privacyDialogVisible(page))) return;
  await unlockLockDialog(page);
}

/**
 * Seeds the locale through the SAME channel the app itself persists it —
 * the `fibrocare-locale` cookie (see `src/lib/locale.ts`).
 *
 * The SSR root layout reads ONLY the cookie; a localStorage seed alone no
 * longer flips the server render (the client keeps them in sync via the
 * provider). Specs that need a specific locale from the very first paint
 * must seed the cookie through `context.addCookies` so the server HTML
 * already carries `lang`/`dir` and translated strings.
 *
 * Must be awaited BEFORE any page is created in the context.
 */
export async function seedLocale(
  context: {
    addCookies: (cookies: Array<{
      name: string;
      value: string;
      domain?: string;
      path?: string;
      url?: string;
    }>) => Promise<void>;
  },
  locale: "en" | "ar"
): Promise<void> {
  await context.addCookies([
    { name: "fibrocare-locale", value: locale, url: "http://localhost:3000" },
  ]);
}
