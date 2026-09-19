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
import { assertDistinctShots } from "./_image-guard.mjs";

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

  return {
    ready,
    stop: () => {
      // On Windows the shell wrapper (cmd → npm → node) survives child.kill(),
      // leaving an orphaned dev server that blocks the next run's port.
      if (process.platform === "win32" && child.pid) {
        spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } else {
        child.kill();
      }
    },
  };
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

/**
 * Signs in the shared E2E user and persists a FRESH storage state.
 * Mirrors e2e/auth.setup.ts (retry against hydration field-wipes, verify
 * the session cookie directly) and hard-fails — a dead session must abort
 * the capture, never be silently reused (the 2026-09 login-shot incident).
 */
async function signIn(browser) {
  const page = await browser.newPage({ viewport: VIEWPORT });

  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector("#email", { timeout: 20_000 });
    await page.waitForTimeout(1_500); // let React hydrate before submitting

    await page.fill("#email", E2E_EMAIL);
    await page.fill("#password", E2E_PASSWORD);
    // Hydration can wipe the fields between fill and click — re-verify.
    const emailVal = await page.locator("#email").inputValue().catch(() => "");
    if (emailVal !== E2E_EMAIL) continue;

    await page.getByRole("button", { name: "Sign in" }).click();

    // Poll the session cookie instead of the URL (the SPA can bounce back
    // to /login while the cookie is already valid — see auth.setup.ts).
    let hasSession = false;
    for (let i = 0; i < 40 && !hasSession; i++) {
      const cookies = await page.context().cookies();
      hasSession = cookies.some((c) => c.name === "next-auth.session-token" && c.value);
      if (!hasSession) await page.waitForTimeout(500);
    }
    if (!hasSession) continue;

    // Resolve the cookie server-side and confirm we stay off /login.
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForTimeout(2_000);
    if (page.url().includes("/login")) continue;

    await page.context().storageState({ path: STORAGE_STATE });
    await page.close();
    console.log("[auth] signed in, fresh storage state saved");
    return;
  }

  await page.close();
  throw new Error(
    "sign-in failed after 3 attempts — refusing to capture with a dead session"
  );
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

/**
 * The privacy gate (PrivacyGate in src/components/auth/PrivacyLock.tsx)
 * covers every protected route and re-arms on every full page load, showing
 * either the first-run setup dialog (no PIN yet) or the lock dialog. Both
 * accept digits through the keypad's window-level keydown listener, so
 * typing the well-known E2E PIN unlocks either state (typed twice for
 * setup: choose + confirm). Mirrors e2e/helpers/privacy.ts.
 */
const TEST_PIN = "1234";

async function unlockPrivacyGate(page) {
  const gate = page
    .getByRole("dialog", {
      name: /Enter your PIN|أدخل رمز PIN|Set a privacy PIN|تعيين رمز PIN/,
    })
    .first();

  try {
    await gate.waitFor({ state: "visible", timeout: 60_000 });
  } catch {
    console.warn("[gate] no privacy dialog appeared — continuing unlocked");
    return false;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.type(TEST_PIN);
    await page.waitForTimeout(900); // server verify (lock) / stage switch (setup)
    if (!(await gate.isVisible().catch(() => false))) return true;
    await page.keyboard.type(TEST_PIN); // setup dialog: confirm stage
    await page.waitForTimeout(900);
    if (!(await gate.isVisible().catch(() => false))) return true;
  }
  throw new Error("privacy gate did not unlock with the test PIN");
}

async function shot(browser, { file, url, waitFor = "main", before }) {
  const page = await browser.newPage({ viewport: VIEWPORT, storageState: AR_STATE });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await unlockPrivacyGate(page);
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

    // A dead/failed session aborts the capture loudly (never fall back to
    // a stale storage state — that is how every -ar shot became a login
    // page in the 2026-09 incident).
    await signIn(browser);
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

    // Content guard: fail loudly if any two shots came out near-identical
    // (the 2026-09 incident — one page saved under all five -ar names).
    await assertDistinctShots(
      [
        { file: "fog-shield-ar.png", label: "Fog Shield (ar)" },
        { file: "clinical-hub-ar.png", label: "Clinical Hub (ar)" },
        { file: "sos-modal-ar.png", label: "SOS modal (ar)" },
        { file: "diet-pantry-ar.png", label: "Diet pantry (ar)" },
        { file: "medical-summary-ar.png", label: "Medical summary (ar)" },
      ],
      IMAGES_DIR
    );
    console.log("[guard] all 5 screenshots pairwise-distinct ✓");

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
