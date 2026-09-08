// Temporary probe: verify the hero video autoplays on the LIVE production
// landing page. Checks visibility flip, real playback progress, loop attr,
// duration, and absence of the "Demo video is being prepared" fallback.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "https://fibrocare.vercel.app";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  locale: "en",
});
const page = await context.newPage();

const videoErrors = [];
page.on("requestfailed", (req) => {
  if (req.url().includes("/videos/")) videoErrors.push(`${req.url()} -> ${req.failure()?.errorText}`);
});
page.on("response", (res) => {
  if (res.url().includes("/videos/") && res.status() >= 400) videoErrors.push(`${res.url()} -> HTTP ${res.status()}`);
});

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 60_000 });

// Scroll the hero video into view so it loads and plays like a real visit.
const figure = page.locator("figure", { has: page.locator("video") }).first();
await figure.scrollIntoViewIfNeeded();

const video = page.locator("video").first();
await video.waitFor({ state: "attached", timeout: 15_000 });

// 1. Visibility: opacity flips from 0 once readyState >= 3 (the component
//    hides the element while loading). Wait up to 25s (prod CDN is fast,
//    but the 1.5MB WebM needs a moment on first hit).
const visible = await video
  .evaluate((el) => new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      const style = getComputedStyle(el);
      const isVisible = style.opacity !== "0" && el.getClientRects().length > 0;
      if (isVisible || Date.now() - start > 25_000) resolve(isVisible);
      else setTimeout(tick, 250);
    };
    tick();
  }));
console.log("1. video visible (opacity flipped):", visible);

// 2. Element state
const state = await video.evaluate((el) => ({
  readyState: el.readyState,
  paused: el.paused,
  muted: el.muted,
  loop: el.loop,
  autoplay: el.autoplay,
  duration: el.duration,
  src: el.currentSrc,
}));
console.log("2. state:", JSON.stringify(state));
console.log("   duration ~30.5s (full walkthrough)?", state.duration > 29 && state.duration < 32);

// 3. REAL playback: sample currentTime twice, 3s apart.
const t1 = await video.evaluate((el) => el.currentTime);
await page.waitForTimeout(3_000);
const t2 = await video.evaluate((el) => el.currentTime);
const advancing = t2 > t1 && !state.paused;
console.log(`3. playback advancing: t1=${t1.toFixed(2)}s -> t2=${t2.toFixed(2)}s (Δ ${(t2 - t1).toFixed(2)}s) ->`, advancing);

// 4. No fallback card
const fallback = await page.getByText("Demo video is being prepared").count();
console.log("4. 'Demo video is being prepared' fallback shown:", fallback > 0 ? "YES (BAD)" : "no ✓");

// 5. Asset requests all clean
console.log("5. video asset request errors:", videoErrors.length === 0 ? "none ✓" : videoErrors.join("; "));

// Screenshot evidence of the playing hero video.
await figure.screenshot({ path: "tmp/hero-video-prod.png" });
console.log("6. screenshot saved: tmp/hero-video-prod.png");

const pass = visible && advancing && !state.paused && fallback === 0 && videoErrors.length === 0;
console.log("\n=== VERDICT:", pass ? "PASS — video autoplays on prod ✓" : "FAIL", "===");

await browser.close();
process.exitCode = pass ? 0 : 1;
