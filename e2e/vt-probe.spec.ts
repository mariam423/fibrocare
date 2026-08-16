import { test, expect } from "@playwright/test";

test.describe("vt-test probe", () => {
  test("same-route ViewTransition fires startViewTransition", async ({ page }) => {
    await page.addInitScript(() => {
      const read = () => Number(sessionStorage.getItem("__vtCount") || 0);
      const orig = document.startViewTransition?.bind(document);
      if (orig) {
        document.startViewTransition = (cb: any) => {
          const c = read() + 1;
          sessionStorage.setItem("__vtCount", String(c));
          return orig(cb);
        };
      }
    });

    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto("/vt-test", { waitUntil: "domcontentloaded" });
    const btn = page.locator("#vt-toggle");
    await btn.waitFor({ state: "visible" });
    await page.waitForTimeout(1200);

    const boxBefore = await page.locator("#vt-box").innerText();

    const direct = await page.evaluate(async () => {
      const t = document.startViewTransition!(() => {});
      await t.ready;
      t.finished.then(() => {});
      return true;
    });
    console.log("direct raw startViewTransition call OK:", direct);

    for (let i = 0; i < 3; i++) {
      await btn.click();
      await page.waitForTimeout(300);
      const text = await page.locator("#vt-box").innerText().catch(() => "");
      if (text !== boxBefore) {
        console.log("box changed:", boxBefore, "->", text);
        break;
      }
    }
    const boxAfter = await page.locator("#vt-box").innerText();
    console.log("box before:", boxBefore, "| after:", boxAfter);
    const countAfterTransition = await page.evaluate(
      () => Number(sessionStorage.getItem("__vtCount") || 0)
    );

    const syncBtn = page.locator("#vt-toggle-sync");
    await syncBtn.click();
    await page.waitForTimeout(400);
    const syncText = await page.locator("#vt-box-sync").innerText();
    const countAfterSync = await page.evaluate(
      () => Number(sessionStorage.getItem("__vtCount") || 0)
    );
    console.log(
      "sync box now:",
      syncText,
      "| count after transition-toggles:",
      countAfterTransition,
      "| count after flushSync toggle:",
      countAfterSync
    );

    const count = countAfterSync;
    const reactVersion = await page.evaluate(() => {
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      return hook?.renderers?.size ? "devtools-present" : "no-devtools-hook";
    });
    console.log(
      "probe startViewTransition calls:",
      count,
      "| errors:",
      errors,
      "|",
      reactVersion
    );
    expect(direct, "raw API call should have counted").toBe(true);
    expect(count, "same-route VT should fire").toBeGreaterThan(0);
  });
});
