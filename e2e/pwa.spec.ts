import { test, expect } from "@playwright/test";

/**
 * PWA & offline verification.
 *
 * Runs against `playwright.pwa.config.ts`, which serves the production build
 * (created ahead of time by `npm run test:e2e:pwa` → scripts/run-pwa-e2e.mjs)
 * with `next start`. The service worker registers on localhost and precaches
 * the public app shell at install time.
 *
 * Covers:
 *   1. Service worker registration + activation + page control
 *   2. The precached app shell (/, /resources, /resources/exercises, /offline)
 *   3. Manifest installability (display, start_url, icon set)
 *   4. Offline navigation to a precached page
 *   5. Offline navigation to an uncached route → styled /offline fallback
 *
 * Runs unauthenticated: all of the above is public behavior. The offline
 * phases intentionally fail network requests (ERR_INTERNET_DISCONNECTED and
 * the auth-session fetch), so console errors are expected and not asserted.
 */

const PRECACHED_SHELL = ["/", "/resources", "/resources/exercises", "/offline"];

test("service worker registers, precaches the shell, and serves offline fallbacks", async ({
  page,
  context,
}) => {
  await test.step("service worker registers and takes control", async () => {
    await page.goto("/", { waitUntil: "load" });

    // `navigator.serviceWorker.ready` can resolve while the worker is still
    // "activating"; wait for it to reach "activated" (clients.claim() runs
    // on activate).
    await expect
      .poll(
        () =>
          page.evaluate(async () => {
            const reg = await navigator.serviceWorker.ready;
            return reg.active?.state ?? null;
          }),
        { timeout: 30_000, message: "service worker should reach activated" }
      )
      .toBe("activated");

    // A reload guarantees this page is actually controlled by the worker —
    // required for the offline phases below to go through the SW.
    await page.reload({ waitUntil: "load" });
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  });

  await test.step("app shell is precached at install", async () => {
    const cached = await page.evaluate(async () => {
      const names = await caches.keys();
      // Workbox names its precache cache `workbox-precache-*`; match by
      // prefix so the spec doesn't drift on version/scope changes.
      const precacheName = names.find((name) => name.startsWith("workbox-precache"));
      if (!precacheName) return null;
      const cache = await caches.open(precacheName);
      return (await cache.keys()).map((req) => new URL(req.url).pathname).sort();
    });

    expect(cached).not.toBeNull();
    for (const path of PRECACHED_SHELL) {
      expect(cached, `shell cache should contain ${path}`).toContain(path);
    }
    // The point of Workbox injectManifest: content-hashed /_next/static
    // chunks are precached at install, so a FRESH install works offline
    // with no prior online visit.
    expect(cached!.some((p) => p.startsWith("/_next/static/")), "hashed chunks should be precached").toBe(
      true
    );
    // Auth-gated routes must NOT be precached: a logged-out install would
    // otherwise cache the login page under /dashboard.
    expect(cached).not.toContain("/dashboard");
  });

  await test.step("manifest is installable", async () => {
    const manifest = await page.evaluate(async () => {
      const m = (await (await fetch("/manifest.json")).json()) as {
        display: string;
        start_url: string;
        icons: Array<{ sizes: string }>;
      };
      return m;
    });
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/dashboard");
    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
  });

  await test.step("a precached page renders offline", async () => {
    await context.setOffline(true);
    // Network-first strategy: offline → serve the precached copy.
    await page
      .goto("/resources/exercises", { waitUntil: "domcontentloaded", timeout: 30_000 })
      .catch(() => {});
    await expect(page.getByRole("heading", { name: "Exercises" })).toBeVisible({
      timeout: 15_000,
    });
    // And it is the real page, not the offline fallback.
    expect(await page.locator(".fc-title").count()).toBe(0);
  });

  await test.step("an uncached route falls back to the styled /offline page", async () => {
    // /privacy was never visited online and is not precached: the SW's
    // network-first handler falls back to the cached /offline page.
    await page
      .goto("/privacy", { waitUntil: "domcontentloaded", timeout: 30_000 })
      .catch(() => {});
    await expect(page.locator(".fc-title")).toContainText(/offline/i, { timeout: 15_000 });
    await expect(page.locator("#fc-retry")).toBeVisible();
  });
});
