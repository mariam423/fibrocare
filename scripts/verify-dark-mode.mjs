import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), "..");
const PORT = Number(process.env.VERIFY_PORT ?? 3199);
const BASE_URL = `http://localhost:${PORT}`;
const STORAGE_STATE = join(REPO_ROOT, "e2e", ".auth", "user.json");
const OUT = process.env.TEMP || ".";
const VIEWPORT = { width: 1280, height: 800 };

function startDevServer() {
  const child = spawn("npm", ["run", "dev", "--", "-p", String(PORT)], {
    cwd: REPO_ROOT,
    env: { ...process.env, NODE_ENV: "development" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  child.stdout.on("data", (c) => {
    const line = c.toString();
    if (line.trim()) console.log(`[dev:${PORT}] ${line.trimEnd()}`);
  });
  child.stderr.on("data", (c) => console.error(`[dev:err] ${c.toString().trimEnd()}`));
  let resolved = false;
  const ready = new Promise((resolve, reject) => {
    const onData = (c) => {
      if (resolved) return;
      if (/Ready in|Local:\s+http/i.test(c.toString())) {
        resolved = true;
        resolve();
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", (code) => {
      if (!resolved) reject(new Error(`dev server exited early (${code})`));
    });
    setTimeout(() => {
      if (!resolved) reject(new Error("dev server startup timeout (120s)"));
    }, 120_000);
  });
  return { ready, stop: () => child.kill() };
}

async function waitForHttp(url, tries = 40) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server did not respond at ${url}`);
}

function boxesIntersect(a, b) {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y);
}

async function floatingBoxes(page) {
  return page.evaluate(() => {
    const results = [];
    const els = Array.from(document.querySelectorAll("body *"));
    for (const el of els) {
      const style = getComputedStyle(el);
      if (style.position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      results.push({
        cls: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 90),
        x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height),
        bottom: Math.round(r.bottom), z: parseInt(style.zIndex, 10) || 0,
      });
    }
    return results;
  });
}

const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "FibroCareE2E2026!";

async function ensureSignedIn(browser, storageStatePath, baseUrl) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(() => {});
  await page.fill("#email", E2E_EMAIL).catch(() => {});
  await page.fill("#password", E2E_PASSWORD).catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForURL(/dashboard/, { timeout: 60_000 }).catch(() => {});
  const url = page.url();
  await context.storageState({ path: storageStatePath }).catch(() => {});
  await context.close();
  return url;
}

async function main() {
  const useExisting = process.env.VERIFY_USE_EXISTING === "1";
  const dev = useExisting ? { stop: () => {} } : startDevServer();
  let browser;
  try {
    if (useExisting) {
      await waitForHttp(BASE_URL);
      console.log("[verify] using existing dev server");
    } else {
      await dev.ready;
      await waitForHttp(BASE_URL);
      console.log("[verify] dev server up");
    }

    browser = await chromium.launch({ headless: true });
    const authUrl = await ensureSignedIn(browser, STORAGE_STATE, BASE_URL);
    console.log(`[verify] post-login url=${authUrl}`);
    const page = await browser.newPage({
      viewport: VIEWPORT,
      colorScheme: "dark",
      storageState: STORAGE_STATE,
    });
    await page.addInitScript(() => {
      try {
        localStorage.setItem("fibrocare:dark", "true");
      } catch {
        /* ignore */
      }
    });

    // --- /dashboard (dark) ---
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("main", { timeout: 30_000 });
    await page.waitForTimeout(1800);

    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const htmlBg = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    const isDarkClass = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    console.log(`[dashboard] html.dark=${isDarkClass} bodyBg=${bodyBg} htmlBg=${htmlBg}`);

    let boxes = await floatingBoxes(page);
    const before = boxes.filter((b) => b.bottom > 750);
    console.log("[dashboard] fixed bottom-zone boxes (before banner):");
    console.log(JSON.stringify(before, null, 1));

    // Force the synthetic PWA install banner.
    await page.evaluate(() => {
      const evt = new Event("beforeinstallprompt");
      evt.preventDefault = () => {};
      evt.prompt = async () => ({ outcome: "dismissed" });
      evt.userChoice = Promise.resolve({ outcome: "dismissed" });
      window.dispatchEvent(evt);
    });
    await page.waitForTimeout(1200);

    const banner = page.getByText(/Add FibroCare|أضِف فيبروكير|Add/).first();
    const bannerVisible = await banner.isVisible().catch(() => false);
    console.log(`[dashboard] install banner visible after synthetic event: ${bannerVisible}`);

    boxes = await floatingBoxes(page);
    const after = boxes.filter((b) => b.bottom > 740);
    console.log("[dashboard] fixed bottom-zone boxes (with banner):");
    console.log(JSON.stringify(after, null, 1));

    let overlaps = [];
    for (let i = 0; i < after.length; i += 1) {
      for (let j = i + 1; j < after.length; j += 1) {
        if (boxesIntersect(after[i], after[j])) overlaps.push(`${after[i].cls.split(" ")[0]} <-> ${after[j].cls.split(" ")[0]}`);
      }
    }
    console.log(overlaps.length ? `OVERLAPS FOUND:\n${overlaps.join("\n")}` : "NO FLOATING-ELEMENT OVERLAPS");

    await page.screenshot({ path: join(OUT, "fibrocare-verify-dashboard-dark.png") });
    await page.locator("main").screenshot({ path: join(OUT, "fibrocare-verify-dashboard-bottom.png") });

    // --- /pro (bottom padding) ---
    await page.goto(`${BASE_URL}/pro`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("main", { timeout: 30_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(OUT, "fibrocare-verify-pro-dark.png") });
    const mainBottom = await page.locator("main").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), scrollHeight: el.scrollHeight, innerHeight: window.innerHeight };
    });
    console.log(`[pro] main bottom=${mainBottom.bottom} scrollH=${mainBottom.scrollHeight} innerH=${mainBottom.innerHeight}`);

    await page.waitForTimeout(2000);
    const sosBottom = await page.evaluate(() => {
      const el = document.querySelector('button[aria-label*="SOS" i], button[aria-label*="نجدة" i], button[aria-label*="مساعدة" i], button[aria-label*="crisis" i]');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), top: Math.round(r.top) };
    });
    console.log(`[pro] SOS FAB box=${JSON.stringify(sosBottom)}`);

    console.log("[verify] done");
  } finally {
    if (browser) await browser.close();
    dev.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});