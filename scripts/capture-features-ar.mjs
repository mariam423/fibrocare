/**
 * capture-features-ar.mjs — Arabic/RTL counterparts of the README feature
 * screenshots. Same pages and conventions as capture-features.mjs, but the
 * browser session carries the `fibrocare-locale=ar` cookie so pages render
 * Arabic from the server (true SSR RTL, not a client-side flip).
 *
 * Mechanics:
 *  - signs in once (reuses the E2E user) and saves storage state
 *  - injects the locale cookie into a copy of that state (user-ar.json)
 *  - every shot opens with the Arabic state → html[dir="rtl"] from SSR
 *
 * Usage: node scripts/capture-features-ar.mjs
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), "..");
const PORT = Number(process.env.CAPTURE_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const IMAGES_DIR = join(REPO_ROOT, "public", "images");
const STORAGE_STATE = join(REPO_ROOT, "e2e", ".auth", "user.json");
const AR_STATE = join(REPO_ROOT, "e2e", ".auth", "user-ar.json");

const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "FibroCareE2E2026!";

const VIEWPORT = { width: 1280, height: 800 };
const LOCALE_COOKIE = "fibrocare-locale";

function startDevServer() {
  const child = spawn("npm", ["run", "dev", "--", "-p", String(PORT)], {
    cwd: REPO_ROOT,
    env: { ...process.env, NODE_ENV: "development" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  child.stdout.on("data", (chunk) => {
    const line = chunk.toString();
    if (line.trim()) console.log(`[dev:${PORT}] ${line.trimEnd()}`);
  });
  child.stderr.on("data", (chunk) => {
    const line = chunk.toString();
    if (line.trim()) console.error(`[dev:err] ${line.trimEnd()}`);
  });

  let resolved = false;
  const ready = new Promise((resolve, reject) => {
    const onData = (chunk) => {
      if (resolved) return;
      if (/Ready in|Local:\s+http/i.test(chunk.toString())) {
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

async function signIn(browser) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(`${BASE_URL}/login`);
  await page.fill("#email", E2E_EMAIL);
  await page.fill("#password", E2E_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 60_000 });
  await page.context().storageState({ path: STORAGE_STATE });
  await page.close();
  console.log("[auth] signed in, storage state saved");
}

/**
 * Clone the authenticated storage state with the Arabic locale cookie
 * injected, so every new context boots SSR'd as `ar` / RTL.
 */
async function buildArabicState() {
  const state = JSON.parse(await readFile(STORAGE_STATE, "utf8"));
  state.cookies = (state.cookies ?? []).filter(
    (c) => c.name !== LOCALE_COOKIE
  );
  state.cookies.push({
    name: LOCALE_COOKIE,
    value: "ar",
    domain: "localhost",
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
    httpOnly: false,
    secure: false,
    sameSite: "Lax",
  });
  await writeFile(AR_STATE, JSON.stringify(state, null, 2));
  console.log("[locale] arabic storage state ready");
}

async function shot(browser, { file, url, waitFor = "main", before }) {
  const page = await browser.newPage({ viewport: VIEWPORT, storageState: AR_STATE });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector(waitFor, { timeout: 30_000 });
    if (before) await before(page);
    await page.waitForTimeout(1500); // let reveals/animations settle
    // Guard: refuse to save a shot that isn't actually RTL Arabic.
    const dir = await page.getAttribute("html", "dir");
    if (dir !== "rtl") throw new Error(`expected html[dir=rtl], got "${dir}"`);
    await page.screenshot({ path: join(IMAGES_DIR, file), fullPage: false });
    console.log(`[shot] ${file} (dir=${dir})`);
  } catch (err) {
    console.error(`[shot] FAILED ${file}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(IMAGES_DIR, { recursive: true });
  const dev = startDevServer();
  let browser;
  try {
    await dev.ready;
    await waitForHttp(BASE_URL);
    console.log(`[capture] dev server up at ${BASE_URL}`);

    browser = await chromium.launch({ headless: true });

    await signIn(browser).catch(async (err) => {
      console.warn(`[auth] direct sign-in failed (${err.message}); continuing with existing storage state if any`);
    });
    await buildArabicState();

    await shot(browser, {
      file: "fog-shield-ar.png",
      url: `${BASE_URL}/fog-shield`,
      waitFor: "main",
    });

    await shot(browser, {
      file: "clinical-hub-ar.png",
      url: `${BASE_URL}/clinical`,
      waitFor: "main",
    });

    await shot(browser, {
      file: "sos-modal-ar.png",
      url: `${BASE_URL}/dashboard`,
      waitFor: "main",
      before: async (page) => {
        const fab = page
          .locator('button[aria-label*="SOS" i], button[aria-label*="نجدة" i], button[aria-label*="طوارئ" i]')
          .first();
        if (await fab.count()) {
          await fab.click();
          await page.waitForTimeout(800);
        }
      },
    });

    await shot(browser, {
      file: "diet-pantry-ar.png",
      url: `${BASE_URL}/diet`,
      waitFor: "main",
      before: async (page) => {
        const chips = page.locator('button[aria-pressed]').filter({ hasText: /شوفان|زبادي|بيض|oats|yogurt|eggs/i });
        const count = Math.min(await chips.count(), 3);
        for (let i = 0; i < count; i += 1) await chips.nth(i).click().catch(() => {});
      },
    });

    await shot(browser, {
      file: "medical-summary-ar.png",
      url: `${BASE_URL}/reports`,
      waitFor: "main",
    });

    await browser.close();
    console.log("[capture] done");
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error("[capture] FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    await dev.stop();
  }
}

main();
