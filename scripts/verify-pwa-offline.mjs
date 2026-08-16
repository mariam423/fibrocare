/* PWA offline verification — run against a running server (dev or prod):
 *   node scripts/verify-pwa-offline.mjs [baseUrl]
 * Verifies SW registration, precache contents, manifest fetch, font caching,
 * offline serving of a precached page, and the /offline fallback page. */
import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] || "http://localhost:3100";
const results = [];
const report = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: "allow" });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});

try {
  // 1. Load homepage; wait for SW to register and finish activating.
  await page.goto(baseUrl, { waitUntil: "load", timeout: 60000 });

  const sw = await page.evaluate(async () => {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000)),
      ]);
      // `ready` can resolve while the worker is still "activating"; wait for
      // it to reach "activated" (poll up to ~10s).
      const deadline = Date.now() + 10000;
      while (
        reg.active &&
        reg.active.state === "activating" &&
        Date.now() < deadline
      ) {
        await new Promise((r) => setTimeout(r, 200));
      }
      return {
        scope: reg.scope,
        state: reg.active ? reg.active.state : null,
        controller: !!navigator.serviceWorker.controller,
      };
    } catch (e) {
      return { error: String(e) };
    }
  });
  report(
    "SW registered & active",
    !sw.error && (sw.state === "activated" || sw.state === "activating"),
    JSON.stringify(sw)
  );

  // 2. Precache contents (Workbox precache cache, found by name prefix).
  const shell = await page.evaluate(async () => {
    try {
      const names = await caches.keys();
      const precacheName = names.find((n) => n.startsWith("workbox-precache"));
      if (!precacheName) return [];
      const cache = await caches.open(precacheName);
      return (await cache.keys()).map((k) => new URL(k.url).pathname).sort();
    } catch {
      return [];
    }
  });
  report(
    "Shell precache populated",
    ["/", "/resources", "/resources/exercises", "/offline"].every((p) => shell.includes(p)),
    shell.join(", ")
  );

  // 2b. Hashed chunks are precached at install — a fresh install works
  // offline with no prior online visit.
  const hashedChunks = shell.filter((p) => p.startsWith("/_next/static/"));
  report("Hashed /_next chunks precached at install", hashedChunks.length > 0, `${hashedChunks.length} chunk(s) precached`);

  // 3. Manifest.
  const manifest = await page.evaluate(async () => {
    const m = await (await fetch("/manifest.json")).json();
    return { name: m.name, display: m.display, start: m.start_url, theme: m.theme_color, icons: m.icons.map((i) => i.sizes).join(",") };
  });
  report(
    "Manifest valid",
    manifest.display === "standalone" && manifest.start === "/dashboard" && manifest.icons.includes("192x192") && manifest.icons.includes("512x512"),
    JSON.stringify(manifest)
  );

  // 4. Font precached at install.
  const fontCached = await page.evaluate(async () => {
    const names = await caches.keys();
    const precacheName = names.find((n) => n.startsWith("workbox-precache"));
    if (!precacheName) return false;
    const c = await caches.open(precacheName);
    // Workbox stores precache keys with a __WB_REVISION__ query param —
    // ignore search params when matching.
    return !!(await c.match("/fonts/ReadexPro-400.ttf", { ignoreSearch: true }));
  });
  report("Font (.ttf) precached at install", fontCached);

  // 5. Offline: precached page serves from cache.
  await context.setOffline(true);
  const resourcesOk = await page
    .goto(`${baseUrl}/resources/exercises`, { waitUntil: "domcontentloaded", timeout: 30000 })
    .then(async () => (await page.title()) !== "" && (await page.locator("body").innerText().catch(() => "")) !== "")
    .catch(() => false);
  report("Offline: /resources/exercises served", resourcesOk);

  // 6. Offline: /offline fallback page renders styled content.
  await page.goto(`${baseUrl}/offline`, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const offlineHeading = await page.locator(".fc-title").textContent().catch(() => null);
  const retryBtn = await page.locator("#fc-retry").count().catch(() => 0);
  const cardBg = await page
    .locator(".fc-card")
    .evaluate((el) => getComputedStyle(el).borderRadius)
    .catch(() => null);
  report(
    "Offline: styled /offline page",
    offlineHeading?.includes("offline") === true && retryBtn === 1,
    `heading="${offlineHeading}" retry=${retryBtn} cardRadius=${cardBg}`
  );

  // 7. Offline: never-visited public route falls back to /offline page.
  await page.goto(`${baseUrl}/privacy`, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const fallbackHeading = await page.locator(".fc-title").textContent().catch(() => null);
  report("Offline: uncached route -> /offline fallback", fallbackHeading?.includes("offline") === true, `heading="${fallbackHeading}"`);
} catch (err) {
  report("Script error", false, String(err));
} finally {
  await context.setOffline(false).catch(() => {});
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (consoleErrors.length) console.log("Console errors:", consoleErrors.slice(0, 5));
process.exit(failed.length ? 1 : 0);
