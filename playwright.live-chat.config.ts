import { defineConfig, devices } from "@playwright/test";

/**
 * Dedicated e2e run for LIVE AI chat (real provider, no mocks).
 *
 * Requires a real GEMINI_API_KEY in the process environment (or .env.local).
 * Unlike playwright.live.config.ts — which uses a fake key and only asserts
 * the passive status badge — this config exercises the full stack: auth →
 * companion → /api/chat → assembleCompanionContext → real Gemini call →
 * guardrail stream → UI render.
 *
 * Runs `next dev` on port 3103 with its own .next distDir so it never
 * touches the main dev server, and AI_MOCK_MODE=false so the companion
 * makes real provider calls. NEXTAUTH_URL matches the port for session
 * cookie resolution.
 */

const PORT = Number(process.env.LIVE_CHAT_E2E_PORT ?? 3103);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /live-chat\.spec\.ts/,
  fullyParallel: false,
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  expect: { timeout: 30_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // Same rationale as the main config: the PWA service worker would
    // pre-fetch /offline and claim the page mid-test, racing assertions.
    serviceWorkers: "block",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "live-chat-auth-setup",
      // Anchored so it does NOT also match live-auth.setup.ts (which targets
      // a different server/port and doesn't wait for the webServer).
      testMatch: /(^|\/)auth\.setup\.ts$/,
    },
    {
      name: "chromium-live-chat",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["live-chat-auth-setup"],
    },
  ],
  webServer: {
    // Dev server (not next start) on a dedicated distDir — live-mode behavior
    // must match what developers actually run. Process env wins over .env, so
    // AI_MOCK_MODE=false forces the real provider path.
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 150_000,
    env: {
      NEXT_DIST_DIR: ".next-live-chat",
      AI_MOCK_MODE: "false",
      // GEMINI_API_KEY is intentionally NOT set here: Next.js loads it from
      // .env.local, and overriding it here would risk clobbering the real
      // value with an empty string.
      NEXTAUTH_URL: BASE_URL,
    },
  },
});
