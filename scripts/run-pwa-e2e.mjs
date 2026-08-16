/**
 * test:e2e:pwa — production build + e2e for PWA / offline behavior.
 *
 * Builds into a dedicated `.next-pwa` distDir (via NEXT_DIST_DIR, see
 * next.config.ts), then runs `playwright.pwa.config.ts` which serves that
 * build with `next start` on port 3102.
 *
 * The build is deliberately kept OUT of playwright's webServer: a cold
 * `next build` inside webServer reliably exceeds the startup timeout on slow
 * machines and leaves orphaned processes behind.
 *
 * Cross-platform: no cross-env / bash env syntax required.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = {
  ...process.env,
  NEXT_DIST_DIR: ".next-pwa",
};

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(cmd, args, { cwd: root, env, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`\n[run-pwa-e2e] ${label} failed (exit ${res.status ?? "signal"}).`);
    process.exit(res.status ?? 1);
  }
}

run("next build (.next-pwa)", "npx", ["next", "build"]);
run("generate service worker (.next-pwa)", "node", ["scripts/build-sw.mjs"]);
run("playwright test (pwa config)", "npx", ["playwright", "test", "--config", "playwright.pwa.config.ts"]);
