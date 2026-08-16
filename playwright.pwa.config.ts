import { defineConfig } from "@playwright/test";

/**
 * Dedicated e2e run for PWA / offline behavior (e2e/pwa.spec.ts).
 *
 * The main playwright.config.ts blocks the service worker for determinism,
 * so this spec runs under its own config that allows it. Like the live-AI
 * config, the production build is produced ahead of time by
 * `npm run test:e2e:pwa` (scripts/run-pwa-e2e.mjs) into `.next-pwa` — a cold
 * `next build` inside webServer would exceed the startup timeout on slow
 * machines and leave orphans behind.
 *
 * Served with `next start` on port 3102 (3100 = prod audit, 3101 = live AI).
 */

const PORT = Number(process.env.PWA_E2E_PORT ?? 3102);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Only the PWA spec runs in this config.
  testMatch: /pwa\.spec\.ts/,
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
    // The whole point: the service worker must be allowed to install.
    serviceWorkers: "allow",
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  webServer: {
    // Production serve only — `.next-pwa` is built ahead of time by
    // scripts/run-pwa-e2e.mjs (see the ai-live pattern). NEXT_DIST_DIR
    // points at the dedicated build (next.config.ts) so this server never
    // touches the main dev server's `.next`; NEXTAUTH_URL must match the
    // port for auth/session calls to resolve on this origin.
    command: `npx next start -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      NEXT_DIST_DIR: ".next-pwa",
      NEXTAUTH_URL: BASE_URL,
    },
  },
});
