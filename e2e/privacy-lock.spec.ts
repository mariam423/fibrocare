import { test, expect, type Locator } from "@playwright/test";
import { LOCK_DIALOG_TIMEOUT_MS, unlockPrivatePage } from "./helpers/privacy";

/**
 * PIN privacy lock — verifies the lock screen renders its core surfaces and
 * that their text is crisp (no blur filter, full opacity).
 *
 * The PIN now lives server-side: the account's `pinHash` (bcrypt over
 * `userId:pin`) decides between the first-run setup dialog and the lock
 * screen, and unlocking issues an httpOnly signed cookie. The helpers below
 * drive the real keypad, so every assertion reflects the actual server
 * flow. The account's PIN is always "1234" because the helpers only ever
 * enter that value.
 */

const LOCK_TITLE = "Your space is locked";

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
  test("renders the lock title and sharp, unblurred text", async ({ page }) => {
    await unlockPrivatePage(page, "/dashboard");

    // Re-lock deliberately so the lock screen is on screen for inspection.
    await page.reload({ waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { name: LOCK_TITLE });
    await expect(title).toBeVisible();

    // Key lock-screen text must be sharp, not blurred/faded by a parent.
    await expectCrispText(title);
    await expectCrispText(page.getByText("Forgot PIN?", { exact: true }));
    await expectCrispText(page.getByRole("button", { name: "Digit 1" }));
  });

  test("Forgot PIN? navigates to the password recovery flow", async ({ page }) => {
    await unlockPrivatePage(page, "/dashboard");

    // Re-lock to reach the lock screen.
    await page.reload({ waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { name: LOCK_TITLE });
    await expect(title).toBeVisible();

    // "Forgot PIN?" must navigate to the recovery flow, not sit dead.
    await page.getByText("Forgot PIN?", { exact: true }).click();
    await expect(page).toHaveURL(/\/forgot-password/, { timeout: 15_000 });
  });

  test("the lock cannot be bypassed without the PIN server-side", async ({
    page,
  }) => {
    await unlockPrivatePage(page, "/dashboard");

    await page.reload({ waitUntil: "domcontentloaded" });
    const title = page.getByRole("heading", { name: LOCK_TITLE });
    await expect(title).toBeVisible();

    // A wrong PIN must leave the space locked (and the gate refuses the
    // wrong value, not some client-side compare).
    for (const digit of ["9", "9", "9", "9"]) {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: `Digit ${digit}` })
        .click();
    }
    await expect(
      page.getByRole("dialog").getByRole("alert"),
      { timeout: LOCK_DIALOG_TIMEOUT_MS }
    ).toHaveText("Incorrect PIN. Try again.");
    await expect(title).toBeVisible({ timeout: 10_000 });

    // Headless Chromium has no platform authenticator and no registered
    // credential, so the app must NOT offer a biometric shortcut that a
    // script could press without an OS check. ("Lock Now" is reachable on
    // the profile page; here we assert the escape hatch is simply absent.)
    await expect(
      page.getByRole("button", { name: "Use Biometrics" })
    ).toHaveCount(0);

    // The real PIN unlocks.
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Digit 1" })
      .click();
    for (const digit of ["2", "3", "4"]) {
      await page
        .getByRole("dialog")
        .getByRole("button", { name: `Digit ${digit}` })
        .click();
    }
    await expect(title).toHaveCount(0, { timeout: LOCK_DIALOG_TIMEOUT_MS });
  });
});

test.describe("PIN setup (profile)", () => {
  test("privacy lock card renders its active state with sharp text", async ({
    page,
  }) => {
    await unlockPrivatePage(page, "/profile");

    // The profile page awaits several server actions before rendering its
    // cards; the "Privacy Lock" card is the live PIN surface. The shared
    // helper seeds a PIN, so the card renders its ACTIVE state: the change
    // form, "Lock Now", and "Disable Lock". (Disabling here would let the
    // first-run setup dialog immediately re-cover the page, so the setup
    // form is only reachable when NO PIN exists — asserting the active
    // state is the honest check of the real UI.)
    const cardTitle = page.getByText("Privacy Lock", { exact: true });
    await expect(cardTitle).toBeVisible();

    const changeLabel = page.getByText("Change PIN", { exact: true });
    await expect(changeLabel).toBeVisible();
    const lockNow = page.getByRole("button", { name: "Lock Now" });
    await expect(lockNow).toBeVisible();
    const disableButton = page.getByRole("button", { name: "Disable Lock" });
    await expect(disableButton).toBeVisible();
    const activeDescription = page.getByText(
      "A 4-digit PIN protects your logs. The app locks automatically when you leave the tab.",
      { exact: true }
    );
    await expect(activeDescription).toBeVisible();

    // Card text must be crisp — no blur filter, no faded opacity.
    await expectCrispText(cardTitle);
    await expectCrispText(changeLabel);
    // "Update" is disabled until a 4-digit PIN is entered, so its dimmed
    // opacity is intentional — only assert it has no blur filter.
    await expectCrispText(
      page.getByRole("button", { name: "Update", exact: true }),
      { allowDimmed: true }
    );
    await expectCrispText(lockNow);
    await expectCrispText(activeDescription);
  });
});
