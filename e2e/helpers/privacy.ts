import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Privacy-lock (PIN) gate handling for authenticated e2e specs.
 *
 * The PrivacyGate (`src/components/auth/PrivacyLock.tsx`) covers every
 * non-public route and decides its state from the SERVER on every full page
 * load:
 *
 *   - account has no `pinHash`   → first-run "Set a privacy PIN" dialog
 *   - account has a `pinHash`    → "Enter your PIN to unlock FibroCare" lock
 *
 * The PIN now lives server-side (bcrypt over `userId:pin`); unlocking issues
 * an httpOnly, HMAC-signed cookie. localStorage seeding is gone, so specs
 * drive the REAL flow: whichever dialog appears (setup or lock), this helper
 * enters the well-known test PIN "1234". Because the helper is the only
 * thing that ever creates a PIN, an account is always in a consistent state:
 *
 *   - no pinHash yet  → setup dialog → we set "1234" → unlocked
 *   - pinHash already → lock dialog  → we verify "1234" → unlocked
 *
 * The gate re-checks on every full load, so helpers must (and do) unlock
 * after each `page.goto`.
 */

export const TEST_PIN = "1234";

/**
 * How long to wait for a privacy dialog to appear after a navigation.
 *
 * Generous on purpose: in CI, the first navigation to a route forces a cold
 * compile of every server component in that subtree, and the gate waits on a
 * server action (`getPrivacyStatus`) before rendering its dialog. 60s keeps
 * the spec stable without slowing down the common (warm) case.
 */
export const LOCK_DIALOG_TIMEOUT_MS = 60_000;

/** The lock dialog's accessible name in both locales (translations.ts). */
const LOCK_DIALOG_NAME = "Enter your PIN to unlock FibroCare";
const LOCK_DIALOG_NAME_AR = "أدخل رمز PIN لفتح FibroCare";

/** The first-run setup dialog's accessible name in both locales. */
const SETUP_DIALOG_NAME = "Set a privacy PIN";
const SETUP_DIALOG_NAME_AR = "تعيين رمز PIN للخصوصية";

/** Lock-dialog locator, tolerant of the active locale. */
export function lockDialog(page: Page) {
  return page
    .getByRole("dialog", {
      name: new RegExp(`${LOCK_DIALOG_NAME}|${LOCK_DIALOG_NAME_AR}`),
    })
    .first();
}

/** First-run setup-dialog locator, tolerant of the active locale. */
export function setupDialog(page: Page) {
  return page
    .getByRole("dialog", {
      name: new RegExp(`${SETUP_DIALOG_NAME}|${SETUP_DIALOG_NAME_AR}`),
    })
    .first();
}

/**
 * Enters `pin` through the real keypad inside `dialog`.
 *
 * Digit buttons expose `privacy.digitAria` ("Digit N" / "الرقم N"); both
 * label shapes are tried so a partially-localized page still unlocks.
 */
async function pressDigits(dialog: Locator, pin: string): Promise<void> {
  for (const digit of pin) {
    const byEn = dialog.getByRole("button", { name: `Digit ${digit}` });
    const byAr = dialog.getByRole("button", { name: `الرقم ${digit}` });
    await expect(byEn.or(byAr).first()).toBeVisible();
    if (await byEn.count()) {
      await byEn.first().click();
    } else {
      await byAr.first().click();
    }
  }
}

/**
 * Waits for whichever privacy dialog the gate presents (setup OR lock) and
 * drives it to the unlocked state with the well-known test PIN. Safe to
 * call from any protected page after a full-page load.
 */
export async function unlockLockDialog(page: Page): Promise<void> {
  const lock = lockDialog(page);
  const setup = setupDialog(page);
  await expect(lock.or(setup).first()).toBeVisible({
    timeout: LOCK_DIALOG_TIMEOUT_MS,
  });

  if (await lock.count()) {
    await pressDigits(lock, TEST_PIN);
  } else {
    // Setup: choose the PIN, confirm it, then the gate opens.
    await pressDigits(setup, TEST_PIN);
    await pressDigits(setup, TEST_PIN);
  }

  await expect(lock.or(setup).first()).toHaveCount(0, {
    timeout: LOCK_DIALOG_TIMEOUT_MS,
  });
}

/**
 * Navigates to `target` and unlocks the privacy gate, whatever state it
 * presents (setup dialog for an unconfigured account, lock dialog for a
 * configured one). Safe to call again after any full page load — each load
 * re-checks the server state.
 */
export async function unlockPrivatePage(
  page: Page,
  target: string
): Promise<void> {
  await page.goto(target, { waitUntil: "domcontentloaded" });
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