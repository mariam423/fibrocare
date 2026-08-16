/**
 * build-sw — generate the production service worker (public/sw.js) with
 * Workbox `injectManifest`.
 *
 * Runs after `next build` (see package.json "build") and after the e2e
 * builds (scripts/run-live-e2e.mjs, scripts/run-pwa-e2e.mjs). The Next.js
 * output directory is read from NEXT_DIST_DIR (default `.next`) so each
 * build serves a manifest matched to its own chunks.
 *
 * What ends up in the precache (so a FRESH install works offline with no
 * prior online visit):
 *   - every content-hashed asset under <dist>/static (JS/CSS/fonts/media)
 *   - the public app-shell pages: /, /resources, /resources/exercises,
 *     /offline (revisioned by the build id)
 *   - every static asset in public/ (fonts, icons, images, manifest.json)
 *   - the self-hosted Workbox runtime files in public/workbox/
 *
 * The Workbox runtime is copied from node_modules into public/workbox/ so
 * the service worker never depends on a CDN (offline-safe).
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = process.env.NEXT_DIST_DIR || ".next";

const WORKBOX_MODULES = ["core", "routing", "strategies", "precaching"];

const hashOf = (filePath) =>
  createHash("md5").update(readFileSync(filePath)).digest("hex").slice(0, 12);

const log = (msg) => console.log(`[build-sw] ${msg}`);

// ── 1. Self-host the Workbox runtime into public/workbox/ ────────────────
const wbDir = join(root, "public", "workbox");
mkdirSync(wbDir, { recursive: true });
for (const mod of WORKBOX_MODULES) {
  const src = join(root, "node_modules", `workbox-${mod}`, "build", `workbox-${mod}.prod.js`);
  const dest = join(wbDir, `workbox-${mod}.prod.js`);
  copyFileSync(src, dest);
  log(`workbox runtime: ${relative(root, dest)} (${(statSync(dest).size / 1024).toFixed(1)} kB)`);
}

// ── 2. Collect the precache manifest ─────────────────────────────────────
const buildId = existsSync(join(root, dist, "BUILD_ID"))
  ? readFileSync(join(root, dist, "BUILD_ID"), "utf8").trim()
  : Date.now().toString(36);
log(`build id: ${buildId} (distDir: ${dist})`);

// Public app-shell pages — revisioned by build id so a rebuild retriggers
// precache updates. Auth-gated routes are deliberately absent: a logged-out
// install would cache the login page under the protected URL.
const shellPages = ["/", "/resources", "/resources/exercises", "/offline"].map((url) => ({
  url,
  revision: `shell-${buildId}`,
}));

// Every static file in public/ (except the generated sw.js itself), with
// content-hash revisions.
const publicFiles = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (full !== join(root, "public", "sw.js")) publicFiles.push(full);
  }
};
walk(join(root, "public"));
const publicAssets = publicFiles.map((file) => ({
  url: "/" + relative(join(root, "public"), file).replace(/\\/g, "/"),
  revision: hashOf(file),
}));

// ── 3. Generate public/sw.js ─────────────────────────────────────────────
const { injectManifest } = await import("workbox-build");
const result = await injectManifest({
  swSrc: join(root, "scripts", "sw.template.js"),
  swDest: join(root, "public", "sw.js"),
  globDirectory: join(root, dist, "static"),
  // Glob URLs are relative to the glob root (.next/static); Next.js serves
  // them at /_next/static/, so prefix every entry.
  modifyURLPrefix: { "": "/_next/static/" },
  // Hashed Next.js chunks (js/css/media) — all of them, so every route's
  // code is available offline after install.
  globPatterns: ["**/*.{js,css,woff2,ttf,svg,png,webp,ico,jpg,jpeg}"],
  // Next.js filenames are content-hashed — no cache-busting query needed.
  dontCacheBustURLsMatching: /[0-9a-f]{12,}/,
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  additionalManifestEntries: [...shellPages, ...publicAssets],
});

for (const warning of result.warnings) log(`warning: ${warning}`);
log(
  `precache manifest: ${result.count} entries, ${(result.size / 1024 / 1024).toFixed(2)} MB ` +
    `(shell pages: ${shellPages.length}, public assets: ${publicAssets.length})`
);
log(`generated public/sw.js (${Math.round((statSync(join(root, "public", "sw.js")).size / 1024))} kB)`);
