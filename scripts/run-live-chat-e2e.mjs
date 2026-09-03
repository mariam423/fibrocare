/**
 * test:e2e:live-chat — REAL-provider chat e2e (no mocks, no fake keys).
 *
 * Unlike run-live-e2e.mjs (fake key, passive status assertions), this run
 * exercises the full live stack: auth → companion → /api/chat → real LLM
 * call → guardrail stream → UI render. The provider key must already exist
 * in .env.local (GEMINI_API_KEY); this script deliberately does NOT set a
 * fake one, because overriding it would clobber the real credential.
 *
 * AI_MOCK_MODE=false is exported explicitly so the runner process (not just
 * the webServer env) agrees that mock replies are forbidden. The dev server,
 * distDir, and port are owned by playwright.live-chat.config.ts (:3103,
 * .next-live-chat distDir so the main dev server is never touched).
 *
 * Cross-platform: no cross-env / bash env syntax required.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const env = {
  ...process.env,
  AI_MOCK_MODE: "false",
};

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(cmd, args, { cwd: root, env, stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`\n[run-live-chat-e2e] ${label} failed (exit ${res.status ?? "signal"}).`);
    process.exit(res.status ?? 1);
  }
}

run("playwright test (live chat config)", "npx", [
  "playwright",
  "test",
  "--config",
  "playwright.live-chat.config.ts",
]);
