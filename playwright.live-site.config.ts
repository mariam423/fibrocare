import { defineConfig, devices } from "@playwright/test";

/**
 * LIVE-SITE smoke config — runs against the real production deployment.
 *
 *   npx playwright test --config playwright.live-site.config.ts
 *   LIVE_SITE_URL=https://fibrocare.vercel.app npx playwright test ...
 *
 * Key differences from the local configs:
 *  - NO webServer: tests hit the deployed site directly.
 *  - baseURL defaults to https://fibrocare.vercel.app (override with
 *    LIVE_SITE_URL for other environments).
 *  - Only live-site-smoke.spec.ts matches; every other spec assumes a
 *    local server (localhost URLs baked into helpers) and must not run.
 *  - Service workers blocked for determinism (same as the local suite).
 *  - No storageState/auth-setup: this suite is intentionally read-only —
 *    it never signs in, never creates accounts, never writes data.
 */

const BASE_URL = process.env.LIVE_SITE_URL ?? "https://fibrocare.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /live-site-smoke\.spec\.ts/,
  fullyParallel: false,
  timeout: 60_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    serviceWorkers: "block",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [{ name: "live-site-chromium", use: devices["Desktop Chrome"] }],
});
