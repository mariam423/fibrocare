/**
 * _image-guard.mjs — pixel-signature helpers for the README screenshot
 * capture scripts.
 *
 * The 2026-09 incident: one dashboard shot was saved under all five feature
 * PNG names (and its Arabic twin under all five -ar names), so every README
 * section displayed the same repeated image. Nothing failed loudly — the
 * guard below makes that class of failure exit non-zero at capture time.
 *
 * Signatures are 64x40 grayscale "fill" resizes compared by mean absolute
 * difference (0-255 scale). Same-engine viewport shots of different pages
 * land > 30 apart; a re-captured copy of the same page lands < 3.
 */

import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const SIG_W = 64;
const SIG_H = 40;

/**
 * Distance threshold above which two screenshots count as distinct pages.
 *
 * Calibrated against measured captures (2026-09): true duplicates — one page
 * saved under several names — land at ≤ 1.4, while genuinely different app
 * pages land at ≥ 4.0 (they share the sidebar/header chrome, which floors
 * their distance). 2.5 sits mid-gap with ~2× margin on both sides.
 */
export const DUPLICATE_THRESHOLD = 2.5;

export async function signature(filePath) {
  return sharp(filePath).resize(SIG_W, SIG_H, { fit: "fill" }).grayscale().raw().toBuffer();
}

export function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

export async function fileSignature(file, imagesDir) {
  return signature(join(imagesDir, file));
}

/**
 * Throws when two or more of the given files are near-identical pixels,
 * or when any of them looks like a signed-out page (login / auth gate) —
 * the two silent failure modes the capture runs must never reproduce.
 *
 * @param {{ file: string, label: string }[]} shots  captured shots, in order
 * @param {string} imagesDir  absolute path to public/images
 */
export async function assertDistinctShots(shots, imagesDir) {
  const sigs = new Map();
  for (const { file } of shots) {
    sigs.set(file, await fileSignature(file, imagesDir));
  }

  const problems = [];
  const names = [...sigs.keys()];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const d = distance(sigs.get(names[i]), sigs.get(names[j]));
      if (d < DUPLICATE_THRESHOLD) {
        problems.push(`NEAR-DUPLICATE: ${names[i]} ~ ${names[j]} (distance ${d.toFixed(2)})`);
      }
    }
  }

  // Signed-out captures all converge on the same auth screen; even when the
  // five shots differ from each other (e.g. animated background), compare
  // against the repo's known login screenshot as a tripwire.
  const loginPath = join(imagesDir, "Log in.jpeg");
  try {
    const loginSig = await signature(loginPath);
    for (const { file } of shots) {
      const d = distance(sigs.get(file), loginSig);
      if (d < DUPLICATE_THRESHOLD) {
        problems.push(`LOOKS-LIKE-LOGIN: ${file} (distance ${d.toFixed(2)})`);
      }
    }
  } catch {
    // reference screenshot absent — pairwise check still ran
  }

  if (problems.length) {
    throw new Error(
      `Screenshot content guard failed (${problems.length}):\n  ` +
        problems.join("\n  ") +
        "\nRe-run the capture script after fixing the session/page state."
    );
  }
}

/**
 * Lists PNG files in imagesDir that match neither of the provided name
 * patterns — informational only, used to spot stray captures.
 */
export async function listUnmatchedPngs(imagesDir, keepPattern) {
  const all = await readdir(imagesDir);
  return all.filter((f) => f.endsWith(".png") && !keepPattern.test(f));
}
