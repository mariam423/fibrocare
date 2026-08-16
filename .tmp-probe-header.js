const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    storageState: "e2e/.auth/user.json",
  });
  const page = await context.newPage();

  for (const path of ["/dashboard", "/health-logs", "/profile", "/reports"]) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(() => {});
    const deadline = Date.now() + 50_000;
    while (Date.now() < deadline) {
      const n = await page.locator("header").count().catch(() => 0);
      if (n > 0) break;
      await page.waitForTimeout(1500);
    }
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll("header")).map((h) => {
        const cs = getComputedStyle(h);
        return { pos: cs.position, top: cs.top, z: cs.zIndex, h: h.offsetHeight, text: (h.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100) };
      });
      const visibleBarCount = Array.from(document.querySelectorAll("header, [class*=sticky]")).filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.position === "fixed" || cs.position === "sticky" || (r.width > 0 && r.height > 0 && el.querySelector("a"));
      }).length;
      return { url: location.pathname, headers, visibleBarCount };
    });
    console.log(`\n=== ${path} === ${JSON.stringify(r)}`);
  }
  await browser.close();
})();
