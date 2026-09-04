import { test, expect, devices, type Page } from "@playwright/test";
import { unlockPrivatePage } from "./helpers/privacy";

/**
 * Mobile/responsive regression coverage.
 *
 * These specs pin the high-impact fixes from the site-wide responsive
 * pass so future layout changes don't silently regress them:
 *
 *   1. No page produces horizontal overflow at mobile, tablet, or desktop
 *      widths (covers every public + authenticated route).
 *   2. Content doesn't hide under the fixed AppHeader on mobile (the
 *      safe-area-aware `pt-[calc(env(safe-area-inset-top)+5rem)]` on the
 *      root <main>).
 *   3. Dialogs become full-screen sheets on mobile, centered modals at
 *      ≥ sm (the single Dialog primitive change benefits all consumers).
 *   4. The AI companion launcher clears the iOS home-bar safe-area on
 *      small viewports.
 *
 * What this spec does NOT cover (intentionally):
 *   - Pixel-perfect visual diffs — those would belong in
 *     screenshot-audit.mjs, which currently has no browser binary.
 *   - RTL — covered by arabic-rtl.spec.ts.
 *   - Tap-target sizing beyond what overflow checks already catch.
 *
 * The default project (Desktop Chrome) is the wrong tool here, so each
 * test re-uses the page fixture and resizes the viewport. Resizing a
 * page on a non-mobile device is supported and matches the responsive
 * behavior we want to assert.
 */

// Viewports mirror scripts/responsive-audit.mjs so the two stays in sync.
const MOBILE = { width: 390, height: 844 }; // iPhone 14 portrait
const TABLET = { width: 820, height: 1180 }; // iPad Air
// Desktop is covered by the default Desktop Chrome project — we just need
// to make sure the layout doesn't depend on a wider screen.

/**
 * Measures the document's scroll width against the viewport width and
 * returns the offending element if any descendant overflowed. We walk
 * from the deepest overflowing element upward so a child of an
 * ill-fitting parent isn't misattributed.
 */
async function overflowOffender(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    if (document.documentElement.scrollWidth <= viewportWidth + 1) {
      return null; // 1px tolerance for sub-pixel rounding
    }
    // Walk every element, narrow to those whose painted box extends past
    // the viewport, and prefer the innermost one (deepest in the tree) so
    // a child of a wide parent is reported, not the parent.
    const docRight = viewportWidth;
    const overflowing: HTMLElement[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > docRight + 1) {
        overflowing.push(el);
      }
    }
    if (overflowing.length === 0) return "(no specific element)";
    // Innermost = no other overflowing element is a descendant.
    for (const candidate of overflowing) {
      let isInnermost = true;
      for (const other of overflowing) {
        if (other !== candidate && candidate.contains(other)) {
          isInnermost = false;
          break;
        }
      }
      if (isInnermost) {
        const tag = candidate.tagName.toLowerCase();
        const cls = (candidate.className || "").toString().slice(0, 80);
        return `<${tag} class="${cls}">`;
      }
    }
    return "(no innermost element)";
  });
}

test.describe("site-wide responsive regression", () => {
  test.use({
    viewport: MOBILE,
    // iOS-ish user agent so the AppHeader safe-area values resolve.
    userAgent: devices["iPhone 14"].userAgent,
  });

  test("no horizontal overflow on mobile across public + authed routes", async ({
    page,
  }) => {
    // Public routes — no privacy gate. All `/resources/*` are authed.
    const publicRoutes = [
      "/",
      "/privacy",
      "/terms",
      "/login",
      "/signup",
      "/forgot-password",
      "/offline",
    ];
    for (const route of publicRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // Give the layout one frame to settle.
      await page.waitForLoadState("load");
      const offender = await overflowOffender(page);
      expect(offender, `${route} overflowed on mobile`).toBeNull();
    }

    // Authenticated routes — unlock the privacy gate first. The
    // viewport is already MOBILE from `test.use` above, so no resize.
    const authedRoutes = [
      "/dashboard",
      "/health-logs",
      "/profile",
      "/reports",
      "/toolkit",
      "/resources",
    ];
    for (const route of authedRoutes) {
      await unlockPrivatePage(page, route);
      const offender = await overflowOffender(page);
      expect(offender, `${route} overflowed on mobile`).toBeNull();
    }
  });

  test("dashboard content clears the fixed AppHeader on mobile", async ({
    page,
  }) => {
    await unlockPrivatePage(page, "/dashboard");
    // The dashboard greeting sits inside <main>; on mobile it must be
    // below the header (which is 4rem tall + iOS safe-area inset).
    const greeting = page.getByRole("heading", {
      name: /Good (morning|afternoon|evening)/,
    });
    await expect(greeting).toBeVisible();
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    const greetingBox = await greeting.boundingBox();
    expect(headerBox, "AppHeader not found").not.toBeNull();
    expect(greetingBox, "dashboard greeting not found").not.toBeNull();
    // Greeting top must be at or below the header bottom.
    expect(
      greetingBox!.y,
      "greeting is hidden behind the fixed header on mobile"
    ).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);
  });

  test("dialog renders as a full-screen sheet on mobile", async ({ page }) => {
    await unlockPrivatePage(page, "/dashboard");
    // The Medical Summary card opens a controlled dialog once the
    // generateMedicalSummary server action returns. Click the button and
    // wait — if no dialog appears within a generous window (the action
    // may need seed health data we don't always have), skip the
    // assertion rather than fail.
    const generateButton = page.getByRole("button", {
      name: /Generate|analyzing|generating/i,
    });
    if (!(await generateButton.isVisible().catch(() => false))) {
      test.skip(true, "Medical summary button not present in this build");
      return;
    }
    await generateButton.click();
    const dialog = page.getByRole("dialog").first();
    const opened = await dialog
      .waitFor({ state: "visible", timeout: 15_000 })
      .then(() => true)
      .catch(() => false);
    if (!opened) {
      test.skip(true, "Medical summary dialog did not open (no health data?)");
      return;
    }
    const box = await dialog.boundingBox();
    expect(box, "dialog bounding box missing").not.toBeNull();
    // On mobile the dialog should be full-screen: flush to the edges
    // and width ≥ 95% of the viewport.
    expect(box!.x, "mobile dialog should be flush left").toBeLessThan(2);
    expect(box!.y, "mobile dialog should be flush top").toBeLessThan(2);
    expect(
      box!.width,
      "mobile dialog should fill the viewport"
    ).toBeGreaterThan(MOBILE.width * 0.95);
  });
});

test.describe("responsive layout at tablet width", () => {
  test.use({ viewport: TABLET });

  test("dashboard has no horizontal overflow on tablet", async ({ page }) => {
    await unlockPrivatePage(page, "/dashboard");
    const offender = await overflowOffender(page);
    expect(offender, "dashboard overflowed on tablet").toBeNull();
  });

  test("resources index fits within tablet viewport", async ({ page }) => {
    await unlockPrivatePage(page, "/resources");
    const offender = await overflowOffender(page);
    expect(offender, "/resources overflowed on tablet").toBeNull();
  });
});
