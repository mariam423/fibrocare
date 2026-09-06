/**
 * build-gif.mjs — compose the PNG frames captured by `capture-demo.mjs`
 * into a single animated GIF for the README.
 *
 * Input:  tmp/capture/<screen>/01.png … NN.png
 * Output: assets/fibrocare-repo-demo.gif
 *
 * No ffmpeg required. Uses `sharp` (already in node_modules) to:
 *   1. Resize each frame to a consistent width.
 *   2. Optionally composite a title-card frame at the start.
 *   3. Encode as an animated GIF with a per-frame delay of 500 ms.
 *
 * The encoding uses sharp's built-in GIF support. Quality is "good enough"
 * for a README; if you need tighter palette control, install `gifenc` and
 * this script will pick it up automatically.
 *
 * Usage:
 *   node scripts/build-gif.mjs                 # build from tmp/capture
 *   node scripts/build-gif.mjs --frames <dir>   # custom input dir
 *   node scripts/build-gif.mjs --width 720     # default 720
 *   node scripts/build-gif.mjs --delay 600     # ms per frame, default 500
 */

import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), "..");

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(name);
  return i === -1 ? fallback : argv[i + 1];
};

const FRAMES_DIR = arg("--frames", join(REPO_ROOT, "tmp", "capture"));
const WIDTH = Number(arg("--width", 720));
const DELAY_MS = Number(arg("--delay", 500));
const ASSETS_DIR = join(REPO_ROOT, "assets");
const OUTPUT = join(ASSETS_DIR, "fibrocare-repo-demo.gif");

const SCREEN_ORDER = ["landing", "resources", "modal"];

/**
 * Build a title-card PNG (sharp can render SVG directly).
 * 1.2 seconds at DELAY_MS pace → ceil(DELAY_MS * 1.2 / DELAY_MS) frames worth.
 * We render one 1200×600 PNG and pass it through the same pipeline.
 */
async function buildTitleCard() {
  const titleSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ecfeff"/>
          <stop offset="100%" stop-color="#e0e7ff"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
          <stop offset="60%" stop-color="#34d399" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#bg)"/>
      <rect width="1200" height="600" fill="url(#glow)"/>
      <text x="600" y="280" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="86" font-weight="700" fill="#0f172a">🌿 FibroCare</text>
      <text x="600" y="360" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="32" font-weight="500" fill="#475569">A calm companion for fibromyalgia care</text>
      <text x="600" y="430" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="22" font-weight="400" fill="#64748b">Daily check-in · Care library · RAG-grounded AI</text>
    </svg>
  `;
  return sharp(Buffer.from(titleSvg))
    .resize({ width: WIDTH, fit: "inside" })
    .png()
    .toBuffer();
}

/**
 * Collect frame buffers for a single screen folder, in order.
 * Returns PNG buffers (not raw), so sharp can auto-detect dimensions
 * and we can pass them as an animated set.
 */
async function framesForScreen(name) {
  const dir = join(FRAMES_DIR, name);
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir))
    .filter((f) => f.endsWith(".png"))
    .sort();
  const buffers = [];
  for (const f of files) {
    const buf = await sharp(join(dir, f))
      .resize({ width: WIDTH, fit: "inside" })
      .png()
      .toBuffer();
    buffers.push(buf);
  }
  return buffers;
}

/**
 * Build the GIF.
 *
 * Pipeline:
 *   1. Title card (1 SVG → PNG → same pipeline).
 *   2. Concatenate all per-screen frames in order, each as a PNG buffer
 *      already resized to WIDTH.
 *   3. sharp accepts an array of PNG buffers with `{ animated: true }` and
 *      encodes them as a single animated GIF. `delay` is per-frame in
 *      hundredths of a second (GIF spec), so we convert ms → cs.
 */
async function buildGif() {
  await mkdir(ASSETS_DIR, { recursive: true });

  const titleBuf = await buildTitleCard();
  const titlePng = await sharp(titleBuf)
    .resize({ width: WIDTH, fit: "inside" })
    .png()
    .toBuffer();

  const screens = await Promise.all(SCREEN_ORDER.map(framesForScreen));
  const allFrames = screens.flat();

  if (allFrames.length === 0) {
    throw new Error(
      `no PNG frames found under ${FRAMES_DIR}. Run 'npm run demo:capture' first.`,
    );
  }

  const frames = [titlePng, ...allFrames];
  // Per-frame delay in centiseconds (1/100 s). Title is 1.5 s, rest is DELAY_MS.
  const delaysCs = [
    150, // 1.5 s title
    ...new Array(allFrames.length).fill(Math.round(DELAY_MS / 10)),
  ];

  // Read the first frame's dimensions to report them in the success log.
  const probe = await sharp(frames[0]).metadata();

  await sharp(frames, { animated: true })
    .gif({
      loop: 0,
      delay: delaysCs,
      // No `colors` arg → sharp picks a palette per frame.
    })
    .toFile(OUTPUT);

  // Report file size for the user.
  const st = await import("node:fs/promises").then((m) => m.stat(OUTPUT));
  console.log(
    `[gif] wrote ${OUTPUT} (${(st.size / 1024).toFixed(0)} KB, ${frames.length} frames @ ${probe.width}×${probe.height})`,
  );
}

buildGif().catch((err) => {
  console.error("[gif] FAILED:", err.message);
  process.exitCode = 1;
});
