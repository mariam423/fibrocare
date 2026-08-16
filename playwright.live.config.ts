import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated e2e run for the "live AI" rendering path.
 *
 * Starts its own dev server on a dedicated port (default 3101) with a FAKE
 * GEMINI_API_KEY injected via `webServer.env` — process env wins over `.env`
 * in Next.js, so `isAiConfigured()` reports true and the badge/companion
 * render the live state. Only `e2e/ai-live.spec.ts` runs here; the regular
 * `playwright.config.ts` run (mock/offline mode) is unaffected.
 *
 * The fake key is never a real credential; the spec never triggers an actual
 * provider call.
 */

const PORT = Number(process.env.LIVE_E2E_PORT ?? 3101);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Only the live-AI spec runs in this config.
  testMatch: /ai-live\.spec\.ts/,
  fullyParallel: false,
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  projects: [
    // Lean login-first setup (see live-auth.setup.ts) — the shared
    // throwaway account already exists from the main suite's auth.setup.
    { name: "live-auth-setup", testMatch: /live-auth\.setup\.ts/ },
    {
      name: "chromium-live",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["live-auth-setup"],
    },
  ],
  webServer: {
    // Production serve only — the `.next-live` build is produced ahead of
    // time by `npm run test:e2e:live` (a cold `next build` inside webServer
    // reliably exceeds any timeout on this machine and leaves orphans).
    // NEXT_DIST_DIR points at the dedicated `.next-live` (see
    // next.config.ts) so this server never touches the main dev server's
    // `.next` — Next refuses a second `next dev` sharing it.
    command: `npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_DIST_DIR: ".next-live",
      // Fake, test-only key — enough to flip the app into live mode without
      // any real provider credential. AI_MOCK_MODE=false makes the intent
      // explicit, and NEXTAUTH_URL must match the port for auth redirects.
      GEMINI_API_KEY: "fake-live-e2e-key",
      AI_MOCK_MODE: "false",
      NEXTAUTH_URL: BASE_URL,
    },
  },
});
