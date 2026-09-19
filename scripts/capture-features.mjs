/**
 * capture-features.mjs — one-off Playwright runner that captures README
 * screenshots for the 2026-09 feature wave: Fog Shield, Clinical Hub,
 * SOS crisis modal, diet pantry helper, and reports summary.
 *
 * Mirrors capture-demo.mjs conventions:
 *  - spawns the dev server on :3100 (CAPTURE_PORT to override)
 *  - signs in as the shared E2E user, saves storage state, reuses it
 *  - writes PNGs to public/images/
 *
 * Usage: node scripts/capture-features.mjs [--quick]
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { assertDistinctShots } from "./_image-guard.mjs";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), "..");
const PORT = Number(process.env.CAPTURE_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const IMAGES_DIR = join(REPO_ROOT, "public", "images");
const STORAGE_STATE = join(REPO_ROOT, "e2e", ".auth", "user.json");

const E2E_EMAIL = process.env.E2E_EMAIL ?? "e2e.smoke@fibrocare.local";
const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "FibroCareE2E2026!";

const VIEWPORT = { width: 1280, height: 800 };

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
 *
 * The previous version trusted a possibly-stale storage state and swallowed
 * sign-in failures, so every capture landed on /login and every README
 * screenshot showed the login page (the 2026-09 incident). This version
 * mirrors e2e/auth.setup.ts: retry against hydration field-wipes, verify
 * the session cookie directly (URL polling races the client router), then
 * hard-fail — a dead session must abort the capture, never be reused.
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
  const page = await browser.newPage({ viewport: VIEWPORT, storageState: STORAGE_STATE });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await unlockPrivacyGate(page);
    await page.waitForSelector(waitFor, { timeout: 30_000 });
    if (before) await before(page);
    await page.waitForTimeout(1500); // let reveals/animations settle
    await page.screenshot({ path: join(IMAGES_DIR, file), fullPage: false });
    console.log(`[shot] ${file}`);
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

    // Sign in — a dead/failed session aborts the capture loudly (never
    // fall back to a stale storage state: that is how every screenshot
    // became a login page in the 2026-09 incident).
    await signIn(browser);

    await shot(browser, {
      file: "fog-shield.png",
      url: `${BASE_URL}/fog-shield`,
      waitFor: "main",
    });

    await shot(browser, {
      file: "clinical-hub.png",
      url: `${BASE_URL}/clinical`,
      waitFor: "main",
    });

    await shot(browser, {
      file: "sos-modal.png",
      url: `${BASE_URL}/dashboard`,
      waitFor: "main",
      before: async (page) => {
        const fab = page.locator('button[aria-label*="SOS" i], button[aria-label*="نجدة" i]').first();
        if (await fab.count()) {
          await fab.click();
          await page.waitForTimeout(800);
        }
      },
    });

    await shot(browser, {
      file: "diet-pantry.png",
      url: `${BASE_URL}/diet`,
      waitFor: "main",
      before: async (page) => {
        // Tick a few pantry chips so the meal list is populated in the shot.
        const chips = page.locator('button[aria-pressed]').filter({ hasText: /oats|شوفان|yogurt|زبادي|eggs|بيض/i });
        const count = Math.min(await chips.count(), 3);
        for (let i = 0; i < count; i += 1) await chips.nth(i).click().catch(() => {});
      },
    });

    await shot(browser, {
      file: "medical-summary.png",
      url: `${BASE_URL}/reports`,
      waitFor: "main",
    });

    // Content guard: fail loudly if any two shots came out near-identical
    // (the 2026-09 incident — one page saved under all five feature names).
    await assertDistinctShots(
      [
        { file: "fog-shield.png", label: "Fog Shield" },
        { file: "clinical-hub.png", label: "Clinical Hub" },
        { file: "sos-modal.png", label: "SOS modal" },
        { file: "diet-pantry.png", label: "Diet pantry" },
        { file: "medical-summary.png", label: "Medical summary" },
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
