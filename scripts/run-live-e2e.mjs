/**
 * test:e2e:live — production build + e2e for the "live AI" rendering path.
 *
 * Builds into a dedicated `.next-live` distDir (via NEXT_DIST_DIR, see
 * next.config.ts) with a FAKE GEMINI_API_KEY so the app boots in live mode,
 * then runs `playwright.live.config.ts` which serves that build with
 * `next start` on port 3101.
 *
 * The build is deliberately kept OUT of playwright's webServer: a cold
 * `next build` inside webServer reliably exceeds the startup timeout on
 * slow machines and leaves orphaned processes behind.
 *
 * Cross-platform: no cross-env / bash env syntax required.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = {
  ...process.env,
  NEXT_DIST_DIR: ".next-live",
  // Fake, test-only key — enough to flip the app into live mode without any
  // real provider credential. AI_MOCK_MODE=false makes the intent explicit.
  GEMINI_API_KEY: "fake-live-e2e-key",
  AI_MOCK_MODE: "false",
  // Must match the port playwright.live.config.ts serves on for auth
  // redirects to resolve.
  NEXTAUTH_URL: "http://localhost:3101",
};

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(cmd, args, { cwd: root, env, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`\n[run-live-e2e] ${label} failed (exit ${res.status ?? "signal"}).`);
    process.exit(res.status ?? 1);
  }
}

run("next build (.next-live, live AI env)", "npx", ["next", "build"]);
run("generate service worker (.next-live)", "node", ["scripts/build-sw.mjs"]);
run("playwright test (live config)", "npx", ["playwright", "test", "--config", "playwright.live.config.ts"]);
