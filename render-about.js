const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Pre-set the privacy PIN to a known value
  await context.addInitScript(() => {
    window.localStorage.setItem("fibrocare-privacy-pin", "fallback-bypass");
  });

  await page.goto("http://localhost:3000/resources/about", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  const url = page.url();
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 2500));

  console.log("=== URL:", url);
  console.log("=== TITLE:", title);
  console.log("=== BODY:");
  console.log(bodyText);

  // Screenshot the about page
  await page.screenshot({ path: "/tmp/about-page.png", fullPage: true });
  console.log("=== Screenshot saved: /tmp/about-page.png");

  // Also test mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "/tmp/about-mobile.png", fullPage: true });
  console.log("=== Mobile screenshot saved: /tmp/about-mobile.png");

  await browser.close();
})();
