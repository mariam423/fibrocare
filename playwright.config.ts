import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // The dev server cold-compiles each route in 10-40s on this machine, so
  // serializing workers keeps concurrent compiles from piling up, and the
  // per-test budget must cover navigation + assertions comfortably.
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  // Cold dev-server compiles are slow on this machine, so give assertions
  // room to wait for content that appears late.
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    // The PWA service worker (public/sw.js) installs on first visit and
    // pre-fetches /offline — which 404s and cold-compiles slowly — then
    // claims the page mid-test, racing the dashboard's data fetch. None of
    // the e2e specs test PWA behavior, so block it for determinism.
    serviceWorkers: "block",
    // The "load" event can take >30s for first visits (fonts, charts, etc).
    // DOM content is ready far earlier, and our assertions auto-wait for
    // visible content.
    navigationTimeout: 60_000,
    actionTimeout: 15_000,
  },
  projects: [
    // Creates (or reuses) the throwaway account and stores the session so
    // the smoke tests below run authenticated without per-test logins.
    { name: "auth-setup", testMatch: /(^|\/)auth\.setup\.ts$/ },
    // Unauthenticated tests — landing page, auth flows, Arabic RTL for public pages.
    {
      name: "public",
      use: devices["Desktop Chrome"],
      testMatch: /comprehensive-qa-public\.spec\.ts/,
      // responsive.spec.ts uses viewport overrides + the auth helper, so
      // it only runs under the authenticated chromium project.
      testIgnore: /responsive\.spec\.ts/,
    },
    // Authenticated tests — depend on auth-setup for session state.
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["auth-setup"],
      // Specs with dedicated configs must not be picked up by the default
      // match-all project: pwa.spec.ts runs under playwright.pwa.config.ts
      // (SW enabled, production build), ai-live.spec.ts under
      // playwright.live.config.ts (:3101, fake-key live mode), and
      // live-chat.spec.ts under playwright.live-chat.config.ts (:3103,
      // real-provider live mode). The default dev server runs mock/offline
      // mode on :3000, where those specs' assumptions can't hold.
      testIgnore: /pwa\.spec\.ts|ai-live\.spec\.ts|live-chat\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 150_000,
    // E2E_PROMOTE_TOKEN gates the /api/e2e/promote-doctor endpoint
    // (see src/app/api/e2e/promote-doctor/route.ts) so authenticated
    // smoke tests can exercise the doctor-only Doctor Hub surfaces
    // (manual publishing, own-posts workspace). The endpoint refuses
    // every request when the env var is unset, so this is safe to
    // default-on for the test run.
    env: {
      E2E_PROMOTE_TOKEN: process.env.E2E_PROMOTE_TOKEN ?? "e2e-promote",
    },
  },
});
