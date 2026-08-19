/**
 * test:e2e — production build + the full e2e suite.
 *
 * Builds into a dedicated `.next-e2e` distDir (via NEXT_DIST_DIR, see
 * next.config.ts), then runs the default playwright.config.ts which serves
 * that build with `next start` on the default port.
 *
 * The dev server cold-compiles each route on first request, which crashes
 * under a full serialized run; `next start` serves prebuilt routes instead,
 * so the suite survives end-to-end.
 *
 * The build is deliberately kept OUT of playwright's webServer: a cold
 * `next build` inside webServer reliably exceeds the startup timeout on slow
 * machines and leaves orphaned processes behind.
 *
 * Any extra args are forwarded to `playwright test`, so a targeted spec can
 * still be run against the production build:
 *   npm run test:e2e -- e2e/daily-tools.spec.ts
 *
 * Cross-platform: no cross-env / bash env syntax required.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = {
  ...process.env,
  NEXT_DIST_DIR: ".next-e2e",
};

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(cmd, args, { cwd: root, env, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`\n[run-e2e] ${label} failed (exit ${res.status ?? "signal"}).`);
    process.exit(res.status ?? 1);
  }
}

run("next build (.next-e2e)", "npx", ["next", "build"]);
run("generate service worker (.next-e2e)", "node", ["scripts/build-sw.mjs"]);
run("playwright test (prod config)", "npx", ["playwright", "test", ...process.argv.slice(2)]);
