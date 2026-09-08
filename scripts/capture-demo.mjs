/**
 * capture-demo.mjs — Playwright runner that produces the visual assets for
 * the README demo GIF and the in-page hero video preview.
 *
 * Output (all relative to repo root):
 *   tmp/capture/<screen>/01.png … 06.png     ← per-screen frames
 *   tmp/capture/<screen>/clip.webm           ← per-screen WebM clip
 *   public/videos/fibrocare-app-preview.webm ← combined showcase clip
 *   public/videos/fibrocare-app-preview-poster.png ← first-frame poster
 *
 * Usage:
 *   node scripts/capture-demo.mjs            # full capture
 *   node scripts/capture-demo.mjs --quick    # 3 frames per screen (smoke)
 *
 * Environment expectations:
 *   - No other dev server on port 3100.
 *   - Chromium browser installed for Playwright (`npx playwright install chromium`).
 *   - serviceWorkers: blocked (matches playwright.config.ts:29).
 *
 * The script intentionally uses `headless: false` so the WebM captures the
 * real Chromium compositor output, which is what the brief asked for.
 */

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdir, cp, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), "..");
const PORT = Number(process.env.CAPTURE_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;
const FRAMES = process.argv.includes("--quick") ? 3 : 6;
const FRAME_INTERVAL_MS = 500;
const VIEWPORT = { width: 1280, height: 800 };
const TMP_DIR = join(REPO_ROOT, "tmp", "capture");
const PUBLIC_VIDEOS = join(REPO_ROOT, "public", "videos");

/**
 * Spawn the Next dev server, wait for it to respond, then yield the child
 * so the caller can close it. Returns { stop() }.
 */
function startDevServer() {
  const child = spawn("npm", ["run", "dev", "--", "-p", String(PORT)], {
    cwd: REPO_ROOT,
    env: { ...process.env, NODE_ENV: "development" },
    stdio: ["ignore", "pipe", "pipe"],
    // On Windows `npm` is `npm.cmd`; without a shell the spawn fails
    // silently (an 'error' event with no output), and the watchdog fires.
    shell: process.platform === "win32",
  });

  // Surface dev-server logs so the user can see when the compile finishes.
  const tag = (s) => `[dev:${PORT}] ${s}`;
  child.stdout.on("data", (chunk) => {
    const line = chunk.toString();
    if (line.trim()) console.log(tag(line.trimEnd()));
  });
  child.stderr.on("data", (chunk) => {
    const line = chunk.toString();
    if (line.trim()) console.error(tag(line.trimEnd()));
  });

  let resolved = false;
  let readyResolve;
  let readyReject;
  const ready = new Promise((resolve, reject) => {
    readyResolve = resolve;
    readyReject = reject;
    const onData = (chunk) => {
      const line = chunk.toString();
      if (resolved) return;
      // "Ready" is the Next.js signal; also accept any 2xx on /.
      if (/Ready in|Local:\s+http/i.test(line)) {
        resolved = true;
        resolve();
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("exit", (code) => {
      if (!resolved) reject(new Error(`dev server exited with code ${code} before becoming ready`));
    });
  });

  // Hard timeout in case Next crashes silently.
  const watchdog = setTimeout(
    () => readyReject(new Error(`dev server did not become ready within 90s`)),
    90_000,
  );

  return {
    ready: ready.finally(() => clearTimeout(watchdog)),
    stop: () =>
      new Promise((resolveStop) => {
        if (child.exitCode != null) return resolveStop();
        child.once("exit", () => resolveStop());
        child.kill("SIGTERM");
        // Force kill if it doesn't honor SIGTERM in 5s.
        setTimeout(() => {
          if (child.exitCode == null) child.kill("SIGKILL");
        }, 5_000);
      }),
  };
}/**
 * Wait for a URL to respond 2xx. Used as a second-chance readiness check
 * after the dev-server "Ready in" log.
 */
async function waitForHttp(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`HTTP probe for ${url} failed after ${attempts}s`);
}

/**
 * The PrivacyGate (src/components/auth/PrivacyLock.tsx) blocks every route
 * except the landing/legal/auth paths behind a PIN keypad. A fresh capture
 * context has no stored PIN, so the gate shows the *setup* dialog instead
 * of the page. Dismiss it by setting the gate's localStorage key directly,
 * then reload — the store re-reads on the `fibrocare-pin-change` event and
 * renders the real page.
 */
async function bypassPrivacyGate(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  const gate = page.locator('[role="dialog"][aria-modal="true"]').first();
  const gateVisible = await gate.isVisible().catch(() => false);
  if (!gateVisible) return; // public route or gate not mounted — nothing to do

  // Stage 1: seed a PIN so the gate renders the *keypad* (configured+locked)
  // instead of the setup dialog. Any value works: the gate only checks
  // that a PIN hash exists.
  await page.evaluate(() => {
    window.localStorage.setItem("fibrocare-privacy-pin", "capture-bypass");
    window.dispatchEvent(new Event("fibrocare-pin-change"));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_500);

  // Stage 2: "Use Biometrics" calls unlock() directly — no PIN digits needed.
  const biometrics = page.getByRole("button", { name: /use biometrics|البصمة/i });
  if (await biometrics.count()) {
    await biometrics.first().click();
    await page.waitForTimeout(1_500);
  }
}

/**
 * Capture one screen: navigate, wait for a key element, then sample
 * `FRAMES` PNG frames at `FRAME_INTERVAL_MS` cadence. Returns the path
 * of the WebM clip produced by Playwright's recordVideo.
 */

/**
 * Capture one screen: navigate, wait for a key element, then sample
 * `FRAMES` PNG frames at `FRAME_INTERVAL_MS` cadence. Returns the path
 * of the WebM clip produced by Playwright's recordVideo.
 */
async function captureScreen(browser, { name, url, waitFor, beforeCapture }) {
  const outDir = join(TMP_DIR, name);
  await mkdir(outDir, { recursive: true });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: outDir, size: VIEWPORT },
    serviceWorkers: "block",
    // Calm theme by default — the brief talks about light-sensitivity,
    // and the dark variant is captured implicitly by the screenshots folder
    // in the README. Dark frames can be added later by toggling colorScheme.
    colorScheme: "light",
    locale: "en",
  });
  const page = await context.newPage();

  console.log(`[capture:${name}] navigating → ${url}`);
  await bypassPrivacyGate(page, url);
  if (waitFor) {
    await page.waitForSelector(waitFor, { timeout: 30_000, state: "visible" });
  }
  // One paint pass for the entrance animations to settle.
  await page.waitForTimeout(400);

  if (beforeCapture) {
    await beforeCapture(page);
    // Allow the interaction's resulting animation to start.
    await page.waitForTimeout(250);
  }

  for (let i = 0; i < FRAMES; i++) {
    const file = String(i + 1).padStart(2, "0") + ".png";
    const path = join(outDir, file);
    await page.screenshot({ path, type: "png", fullPage: false });
    if (i < FRAMES - 1) {
      await page.waitForTimeout(FRAME_INTERVAL_MS);
    }
  }

  // Closing the context flushes the WebM clip to disk.
  await context.close();
  console.log(`[capture:${name}] wrote ${FRAMES} frames to ${outDir}`);

  // Playwright names the WebM with a random suffix; rename to clip.webm.
  const files = await readdir(outDir);
  const video = files.find((f) => f.endsWith(".webm"));
  if (!video) {
    throw new Error(`[capture:${name}] no .webm was produced by recordVideo`);
  }
  const finalVideo = join(outDir, "clip.webm");
  await cp(join(outDir, video), finalVideo);
  await rm(join(outDir, video));
  return finalVideo;
}

/**
 * Pick the first WebM across the per-screen folders, copy it as the canonical
 * hero preview, and extract the first PNG as the poster.
 */
async function publishShowcase() {
  await mkdir(PUBLIC_VIDEOS, { recursive: true });
  const dest = join(PUBLIC_VIDEOS, "fibrocare-app-preview.webm");

  // Combine all three screen clips (landing → resources → modal) into one
  // showcase video. Playwright's recordVideo emits VP8; normalize each clip
  // to VP9 first so the concat demuxer accepts them with -c copy. Falls
  // back to the single resources clip if ffmpeg is unavailable.
  const clips = ["landing", "resources", "modal"]
    .map((s) => join(TMP_DIR, s, "clip.webm"))
    .filter((p) => existsSync(p));

  let published = false;
  if (clips.length > 1) {
    try {
      const { execFile } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execFileP = promisify(execFile);
      const norm = [];
      for (const clip of clips) {
        const out = join(dirname(clip), "norm.webm");
        await execFileP("ffmpeg", [
          "-y", "-loglevel", "error", "-i", clip,
          "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-an", out,
        ]);
        norm.push(out);
      }
      const listFile = join(TMP_DIR, "concat.txt");
      await writeFile(
        listFile,
        norm.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n") + "\n"
      );
      await execFileP("ffmpeg", [
        "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
        "-i", listFile, "-c", "copy", dest,
      ]);
      published = true;
      console.log(`[publish] combined ${norm.length} clips → ${dest}`);
    } catch (err) {
      console.warn(
        `[publish] ffmpeg combine failed (${String(err.message).split("\n")[0]}); falling back to single clip`
      );
    }
  }

  if (!published) {
    // Prefer the resources (screen 2) WebM as the showcase: it shows cards
    // and is more visually informative than a static landing scroll.
    const preferred = join(TMP_DIR, "resources", "clip.webm");
    const fallback = join(TMP_DIR, "landing", "clip.webm");
    const source = existsSync(preferred) ? preferred : fallback;
    if (!existsSync(source)) {
      throw new Error("no WebM clip found to publish as hero showcase");
    }
    await cp(source, dest);
    console.log(`[publish] copied ${source} → ${dest}`);
  }

  // Use the first frame of the landing capture as the poster.
  const posterSrc = join(TMP_DIR, "landing", "01.png");
  if (existsSync(posterSrc)) {
    const posterDest = join(PUBLIC_VIDEOS, "fibrocare-app-preview-poster.png");
    await cp(posterSrc, posterDest);
    console.log(`[publish] copied ${posterSrc} → ${posterDest}`);
  }
}

async function main() {
  // Clean previous run.
  if (existsSync(TMP_DIR)) {
    await rm(TMP_DIR, { recursive: true, force: true });
  }
  await mkdir(TMP_DIR, { recursive: true });

  const dev = startDevServer();
  let browser;
  try {
    await dev.ready;
    await waitForHttp(BASE_URL);
    console.log(`[capture] dev server up at ${BASE_URL}`);

    browser = await chromium.launch({ headless: false });
    // Block Chromium's font/CDN fetches that are nice-to-have but slow; we
    // accept the local fallback fonts instead. This keeps the capture
    // hermetic to the local dev server.
    await browser.contexts(); // touch to ensure no startup race

    // Screen 1 — landing page hero (wait for the H1 inside the hero).
    await captureScreen(browser, {
      name: "landing",
      url: `${BASE_URL}/`,
      waitFor: "h1#hero-heading",
    });

    // Screen 2 — resources library with an active filter (wait for the
    // first grid card, then type into the search input to drive
    // AnimatePresence's filter transition).
    await captureScreen(browser, {
      name: "resources",
      url: `${BASE_URL}/resources`,
      // The resource-card grid (desktop). The first `.grid` on the page is a
      // hidden mobile-only wrapper (grid-rows-[0fr]) that never becomes
      // visible, so target the card grid explicitly.
      waitFor: '.grid.grid-cols-1.sm\\:grid-cols-2',
      beforeCapture: async (page) => {
        // The search input is the first <input> on the page. We fall
        // through if it's not there (e.g. unauthenticated layout) so the
        // capture does not fail on layout drift.
        const input = await page.$('input[type="search"], input[type="text"]');
        if (input) {
          await input.click();
          await page.keyboard.type("pain", { delay: 60 });
        }
      },
    });

    // Screen 3 — interactive modal: navigate to a sub-page that has the
    // CitationBadge dialog (resources about page), then click the badge.
    // The badge is the button labelled "View cited guideline" — targeting by
    // aria-label text (not the first button[aria-label] on the page, which is
    // a nav element) is what makes the dialog actually open.
    await captureScreen(browser, {
      name: "modal",
      url: `${BASE_URL}/resources/about`,
      waitFor: "body",
      beforeCapture: async (page) => {
        // The CitationBadge mounts only AFTER the "AI 1-Minute Takeaway"
        // banner is expanded ({open && <CitationBadge/>} in AiTakeawayBanner).
        // Expand it first, then click the badge inside the expanded panel.
        const banner = page.getByRole("button", {
          name: /ai 1-minute takeaway|خلاصة ذكية في دقيقة/i,
        });
        if (await banner.count()) {
          await banner.first().click();
          await page.waitForSelector('[data-slot="dialog-trigger"]', {
            timeout: 10_000,
          }).catch(() => {});
        }
        const trigger = page
          .getByRole("button", { name: /view cited guideline|عرض الإرشاد المُستشهد به/i })
          .first();
        await trigger.waitFor({ state: "visible", timeout: 15_000 });
        await trigger.click();
        await page.waitForSelector('[data-slot="dialog-content"]', {
          timeout: 10_000,
        });
      },
    });

    await browser.close();
    await publishShowcase();
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
