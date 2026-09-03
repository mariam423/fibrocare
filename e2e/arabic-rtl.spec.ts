import { test, expect, type Locator, type Page } from "@playwright/test";
import { unlockPrivatePage, unlockLockDialog } from "./helpers/privacy";

/**
 * Arabic i18n & RTL coverage for the four authenticated surfaces:
 *
 *   - The header language toggle flips the app into Arabic: <html> gains
 *     `lang="ar"` + `dir="rtl"` and every surface renders its localized
 *     Arabic copy.
 *   - RTL is a document-level property (LanguageContext sets lang/dir on
 *     <html>), so layout mirroring is proven geometrically: the header
 *     brand, which sits at the inline-start edge, must move to the right
 *     half of the viewport once the document flips to RTL.
 *
 * Locale state: `fibrocare-locale` persists in localStorage, so each test
 * starts from a clean English session (fresh context per test) and flips
 * via the real toggle — no seeding, no reload tricks.
 */
test.describe("Arabic i18n & RTL", () => {
  /** Clicks the header language toggle and waits for the document to flip
   *  to RTL. The toggle is a client component, so on a cold dev-server
   *  compile the click can land before React hydrates — retry until the
   *  direction attribute actually changes.
   *
   *  Note: once the locale flips, the toggle's label becomes "Switch to
   *  English", so a click that *succeeded* can never be re-attempted — the
   *  guard below treats a missing en→ar toggle as "already Arabic" and
   *  returns instead of reload-looping. */
  async function switchToArabic(page: Page) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const toggle = page.getByRole("button", { name: "Switch to Arabic" });
      // Already in Arabic (e.g. a prior retry's click landed and persisted
      // the locale before the dir effect ran) — nothing left to do.
      if ((await toggle.count()) === 0) {
        await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
        return;
      }
      try {
        await toggle.click({ timeout: 10_000 });
      } catch {
        // Not hydrated / not visible yet — reload the page fresh and retry.
        // (A full reload re-locks the privacy gate, so unlock again.)
        await page.reload({ waitUntil: "domcontentloaded" });
        await unlockLockDialog(page).catch(() => {});
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
        // Hydration raced the click (handler not attached) — retry.
      }
    }
    throw new Error("Could not switch the app to Arabic");
  }

  /** Asserts that a given element (the first element of the header flex row)
   *  sits on the inline-start side of the header: left half in LTR, right
   *  half in RTL. Tolerances are generous — the check is about which half
   *  of the header the element occupies, not pixel precision. */
  async function expectStartEdgeOnSide(
    page: Page,
    locator: Locator,
    dir: "ltr" | "rtl"
  ) {
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    await expect(locator).toBeVisible();
    const elBox = await locator.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(elBox).not.toBeNull();

    const elStartX = elBox!.x;
    const headerMidX = headerBox!.x + headerBox!.width / 2;
    if (dir === "rtl") {
      // Inline-start = right under RTL: the element must sit in the right half.
      expect(elStartX).toBeGreaterThan(headerMidX);
    } else {
      // Inline-start = left under LTR.
      expect(elStartX).toBeLessThan(headerMidX);
    }
  }

  /** The header brand ("FibroCare") is the first element in the header flex
   *  row, so its position mirrors the document direction. */
  async function expectBrandMirrored(page: Page, dir: "ltr" | "rtl") {
    await expectStartEdgeOnSide(
      page,
      page.getByRole("link", { name: "FibroCare" }),
      dir
    );
  }

  /** The dashboard is a client component; wait for the greeting to replace
   *  the SSR placeholder name so React is fully hydrated before clicking
   *  the toggle (a click in that window lands on a dead handler). */
  async function awaitHydratedDashboard(page: Page) {
    const greeting = page.getByRole("heading", {
      name: /Good (morning|afternoon|evening)/,
    });
    await expect(greeting).toBeVisible();
    await expect(greeting).not.toContainText("User", { timeout: 30_000 });
  }

  test("language toggle switches the app to Arabic RTL", async ({ page }) => {
    await test.step("load the hydrated dashboard", async () => {
      await unlockPrivatePage(page, "/dashboard");
      await awaitHydratedDashboard(page);
    });

    await test.step("document is LTR before the flip", async () => {
      // The root layout is SSR-aware: with no locale cookie set, it renders
      // lang="en" dir="ltr" directly in the server HTML.
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expectBrandMirrored(page, "ltr");
    });

    await test.step("click the language toggle", async () => {
      await switchToArabic(page);
    });

    await test.step("document flips to Arabic RTL", async () => {
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expectBrandMirrored(page, "rtl");
    });

    await test.step("the Readex Pro typeface is applied", async () => {
      // Readex Pro is the app-wide typeface (Arabic + Latin); assert the
      // computed stack on a rendered Arabic element to lock it in.
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav.getByRole("link", { name: "لوحة التحكم" })).toHaveCSS(
        "font-family",
        /Readex Pro/
      );
    });

    await test.step("nav links render in Arabic", async () => {
      const nav = page.getByRole("navigation", { name: "Primary" });
      await expect(nav.getByRole("link", { name: "لوحة التحكم" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "سجلات الصحة" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "الموارد" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "الملف الشخصي" })).toBeVisible();
    });
  });

  test("dashboard renders its localized Arabic surfaces", async ({ page }) => {
    await test.step("load the hydrated dashboard", async () => {
      await unlockPrivatePage(page, "/dashboard");
      await awaitHydratedDashboard(page);
    });

    await test.step("switch to Arabic", async () => {
      await switchToArabic(page);
    });

    await test.step("AI Care Insight card is in Arabic", async () => {
      await expect(
        page.getByRole("heading", { name: "رؤية الرعاية بالذكاء الاصطناعي" })
      ).toBeVisible();
    });

    await test.step("Gentle Support renders in Arabic", async () => {
      await expect(page.getByRole("heading", { name: "دعم لطيف" })).toBeVisible();
    });

    await test.step("Weekly Progress and AI Insights cards are in Arabic", async () => {
      await expect(page.getByText("التقدم الأسبوعي", { exact: true })).toBeVisible();
      await expect(page.getByText("رؤى الذكاء الاصطناعي", { exact: true })).toBeVisible();
    });
  });

  test("health logs renders Arabic RTL with mirrored navigation", async ({
    page,
  }) => {
    await test.step("load health logs", async () => {
      await unlockPrivatePage(page, "/health-logs");
      await expect(page.getByRole("heading", { name: "Health Logs" })).toBeVisible();
    });

    await test.step("switch to Arabic", async () => {
      await switchToArabic(page);
    });

    await test.step("heading renders in Arabic and RTL mirrors the header", async () => {
      await expect(page.getByRole("heading", { name: "سجلات الصحة" })).toBeVisible();
      await expectBrandMirrored(page, "rtl");
    });

    // The throwaway account may or may not have logs yet — both states are
    // legitimate, so branch exactly like ui-polish.spec.ts does.
    const table = page.getByRole("table");
    const emptyState = page.getByText("لا توجد سجلات", { exact: true });
    await expect(table.or(emptyState)).toBeVisible();

    if ((await table.count()) === 0) {
      await test.step("no logs yet — the Arabic empty state is shown", async () => {
        await expect(emptyState).toBeVisible();
      });
      return;
    }

    await test.step("stat labels are Arabic", async () => {
      await expect(page.getByText("إجمالي الإدخالات", { exact: true })).toBeVisible();
      await expect(page.getByText("متوسط الألم", { exact: true })).toBeVisible();
      await expect(page.getByText("أيام النوبة", { exact: true })).toBeVisible();
    });

    await test.step("table headers are Arabic", async () => {
      await expect(
        table.getByRole("columnheader", { name: "التاريخ" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "مستوى الألم" })
      ).toBeVisible();
      await expect(
        table.getByRole("columnheader", { name: "المزاج" })
      ).toBeVisible();
    });
  });

  test("resources renders Arabic RTL with mirrored navigation", async ({
    page,
  }) => {
    await test.step("load resources", async () => {
      await unlockPrivatePage(page, "/resources");
      // The resources page uses "Care Resources" for both the page h1 and a
      // section h2 — scope to the top-level heading to stay unambiguous.
      await expect(
        page.getByRole("heading", { name: "Care Resources", level: 1 })
      ).toBeVisible();
    });

    await test.step("switch to Arabic", async () => {
      await switchToArabic(page);
    });

    await test.step("heading and category filter are Arabic", async () => {
      await expect(
        page.getByRole("heading", { name: "موارد الرعاية", level: 1 })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "الكل", exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "إدارة النوبات", exact: true })
      ).toBeVisible();
    });

    await test.step("RTL mirrors the header brand", async () => {
      await expectBrandMirrored(page, "rtl");
    });
  });

  test("profile renders Arabic RTL with mirrored navigation", async ({
    page,
  }) => {
    await test.step("load profile", async () => {
      await unlockPrivatePage(page, "/profile");
      await expect(
        page.getByRole("heading", { name: "User Profile", level: 1 })
      ).toBeVisible();
    });

    await test.step("switch to Arabic", async () => {
      await switchToArabic(page);
    });

    await test.step("heading and section titles are Arabic", async () => {
      await expect(
        page.getByRole("heading", { name: "الملف الشخصي", level: 1 })
      ).toBeVisible();
      await expect(page.getByText("إعدادات الحساب", { exact: true })).toBeVisible();
      await expect(page.getByText("الحركة والراحة", { exact: true })).toBeVisible();
    });

    await test.step("RTL mirrors the header brand", async () => {
      await expectBrandMirrored(page, "rtl");
    });
  });

  test("reports renders Arabic RTL with mirrored header", async ({ page }) => {
    await test.step("load reports", async () => {
      await unlockPrivatePage(page, "/reports");
      await expect(
        page.getByRole("heading", { name: "Medical Reports", level: 1 })
      ).toBeVisible();
    });

    await test.step("switch to Arabic", async () => {
      await switchToArabic(page);
    });

    await test.step("heading and stats render in Arabic", async () => {
      await expect(
        page.getByRole("heading", { name: "التقارير الطبية", level: 1 })
      ).toBeVisible();
      // The stats render only after the async snapshot fetch settles.
      await expect(
        page.getByText("متوسط الألم · 90 يومًا", { exact: true })
      ).toBeVisible();
      await expect(page.getByText("أيام النوبات", { exact: true })).toBeVisible();
      await expect(page.getByText("أبرز الأعراض", { exact: true })).toBeVisible();
      await expect(
        page.getByText("رؤى رئيسية", { exact: true })
      ).toBeVisible();
    });

    await test.step("RTL mirrors the header brand", async () => {
      await expectBrandMirrored(page, "rtl");
    });

    // The insights card renders either the severity filter (enough logs to
    // unlock insights) or the locked-state message — branch like the other
    // data-dependent tests.
    const filter = page.getByRole("group", {
      name: "تصفية الرؤى حسب الشدة",
    });
    const locked = page.getByText(
      "سجّل 5 أيام على الأقل من الألم والأعراض لتفعيل رؤى مخصّصة لك.",
      { exact: true }
    );
    await expect(filter.or(locked)).toBeVisible();

    if ((await filter.count()) > 0) {
      await test.step("insights unlocked — the severity filter is Arabic", async () => {
        await expect(filter.getByRole("button", { name: "الكل" })).toBeVisible();
        await expect(filter.getByRole("button", { name: "حرجة" })).toBeVisible();
        await expect(filter.getByRole("button", { name: "انتبه" })).toBeVisible();
        await expect(filter.getByRole("button", { name: "ملاحظة" })).toBeVisible();
      });
    } else {
      await test.step("fewer than 5 days of logs — the Arabic locked message is shown", async () => {
        await expect(locked).toBeVisible();
      });
    }

    await test.step("download card is Arabic", async () => {
      await expect(
        page.getByText("الملخّص السريري PDF", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "تنزيل تقرير PDF" })
      ).toBeVisible();
    });
  });

  test("zen portal renders Arabic RTL", async ({ page }) => {
    await test.step("switch to Arabic on the dashboard first", async () => {
      // The zen page has its own minimal header (no AppHeader, no language
      // toggle), so flip the locale on the dashboard — the preference is
      // stored in localStorage and picked up when /zen loads.
      await unlockPrivatePage(page, "/dashboard");
      await awaitHydratedDashboard(page);
      await switchToArabic(page);
    });

    await test.step("load the zen portal in Arabic", async () => {
      await page.goto("/zen", { waitUntil: "domcontentloaded" });
      await unlockLockDialog(page);
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    });

    await test.step("zen header is Arabic and mirrored", async () => {
      await expect(
        page.getByRole("button", { name: "العودة للوحة التحكم" })
      ).toBeVisible();
      await expect(
        page.getByText("ركّز على تنفسك", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "داكن جدًا" })
      ).toBeVisible();
      // The back button is the first element of the zen header flex row, so
      // under RTL it sits at the right edge (mirroring the app header).
      await expectStartEdgeOnSide(
        page,
        page.getByRole("button", { name: "العودة للوحة التحكم" }),
        "rtl"
      );
    });

    await test.step("breathing bubble shows Arabic prompts", async () => {
      // The prompt flips between شهيق/زفير every second and is rendered both
      // visibly and as sr-only text — match either form, take the first.
      await expect(page.getByText(/شهيق|زفير/).first()).toBeVisible();
    });

    await test.step("soundscape mixer is Arabic", async () => {
      const mixer = page.getByRole("group", { name: "خلاط الأصوات المحيطة" });
      await expect(mixer).toBeVisible();
      await expect(mixer.getByRole("button", { name: /مطر/ })).toBeVisible();
      await expect(mixer.getByRole("button", { name: /غابة/ })).toBeVisible();
      await expect(
        mixer.getByRole("button", { name: /ضوضاء بيضاء/ })
      ).toBeVisible();
      await expect(mixer.getByRole("button", { name: /طنين عميق/ })).toBeVisible();
    });

    await test.step("calming-mode switch is Arabic", async () => {
      await expect(
        page.getByRole("button", { name: "التبديل إلى وضع الهدوء" })
      ).toBeVisible();
    });

    await test.step("ultra-dark toggle flips to Arabic exit label", async () => {
      await page.getByRole("button", { name: "داكن جدًا" }).click();
      await expect(
        page.getByRole("button", { name: "الخروج من الوضع الداكن" })
      ).toBeVisible();
    });
  });
});
