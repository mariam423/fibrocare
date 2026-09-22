import { defineConfig, devices } from "@playwright/test";

/**
 * One-off config for the __Secure- session cookie verification spec
 * (e2e/live-cookie-verify.spec.ts) against the LIVE production site.
 *
 * Separate from playwright.live-site.config.ts because that suite is
 * intentionally read-only (testMatch pins it to live-site-smoke.spec.ts).
 * This config exists only to run the cookie sign-in verification:
 *
 *   npx playwright test --config playwright.live-cookie.config.ts
 *
 * The only write is the project's standard throwaway e2e account
 * (E2E_EMAIL / E2E_PASSWORD defaults, a .local domain).
 */

const BASE_URL = process.env.LIVE_SITE_URL ?? "https://fibrocare.vercel.app";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /live-cookie-verify\.spec\.ts/,
  fullyParallel: false,
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
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
  projects: [{ name: "live-cookie-chromium", use: devices["Desktop Chrome"] }],
});
