/* PWA install-prompt / standalone-mode / offline-toast verification.
 * Run against a running server:
 *   node scripts/verify-pwa-prompt.mjs [baseUrl]
 *
 * Simulates beforeinstallprompt (Chrome only fires it on real installable
 * conditions, so a synthetic event exercises the component's handler) and
 * exercises the standalone code path by mocking window.matchMedia for the
 * `(display-mode: standalone)` query — headless Chromium cannot otherwise be
 * put into an installed-app window (CDP has no display-mode emulation and a
 * real `--app` launch is not reliable under automation).
 *
 * Each scenario runs in a fresh page/context so component state can never
 * leak between scenarios. */
import { chromium } from "@playwright/test";

const baseUrl = process.argv[2] || "http://localhost:3100";
const results = [];
const report = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();
const context = await browser.newContext({ serviceWorkers: "allow" });
const consoleErrors = [];
context.on("page", (p) =>
  p.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  })
);

const BANNER_TEXT = "Add FibroCare to your home screen";
const TOAST_TEXT = "Offline — your check-ins will stay safe on this device.";

const dispatchInstallPrompt = (page) =>
  page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.defineProperty(event, "prompt", {
      value: () => {
        window.__installPromptCalled = true;
        return Promise.resolve();
      },
    });
    Object.defineProperty(event, "userChoice", {
      value: Promise.resolve({ outcome: "accepted", platform: "web" }),
    });
    window.dispatchEvent(event);
  });

/** Dispatch until the banner appears (the listener attaches in a useEffect
 * after hydration, so a single dispatch right after `load` can be lost). */
const dispatchUntilBanner = async (page) => {
  for (let i = 0; i < 30; i++) {
    await dispatchInstallPrompt(page);
    await page.waitForTimeout(300);
    if ((await page.getByText(BANNER_TEXT).count()) > 0) return;
  }
};

const openPage = async (ctx, url = baseUrl) => {
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load", timeout: 60000 });
  return p;
};

const pollFor = async (fn, timeoutMs, intervalMs = 200) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await fn()) return true;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return fn();
};

try {
  // ── 1. Banner appears when beforeinstallprompt fires ──
  const p1 = await openPage(context);
  const before = await p1.getByText(BANNER_TEXT).count();
  await dispatchUntilBanner(p1);
  const after = await p1.getByText(BANNER_TEXT).count();
  report("Install banner appears on beforeinstallprompt", before === 0 && after === 1, `before=${before} after=${after}`);
  await p1.close();

  // ── 2. Dismiss hides the banner without invoking prompt() ──
  const p2 = await openPage(context);
  await dispatchUntilBanner(p2);
  await p2.getByRole("button", { name: "Dismiss" }).click();
  const afterDismiss = await pollFor(async () => (await p2.getByText(BANNER_TEXT).count()) === 0, 5000);
  const promptNotCalled = await p2.evaluate(() => window.__installPromptCalled !== true);
  report("Dismiss hides banner without prompting", afterDismiss && promptNotCalled, `bannerAfter=${afterDismiss} promptCalled=${!promptNotCalled}`);
  await p2.close();

  // ── 3. Add invokes prompt() and hides the banner (accepted install) ──
  const p3 = await openPage(context);
  await dispatchUntilBanner(p3);
  await p3.getByRole("button", { name: "Add", exact: true }).click();
  const promptCalled = await pollFor(async () => (await p3.evaluate(() => window.__installPromptCalled === true)), 5000);
  const afterAdd = await pollFor(async () => (await p3.getByText(BANNER_TEXT).count()) === 0, 5000);
  report("Add calls prompt() + hides banner", promptCalled && afterAdd, `promptCalled=${promptCalled} bannerHidden=${afterAdd}`);

  // ── 4. Standalone mode (mocked display-mode): banner never shows ──
  const standaloneContext = await browser.newContext({ serviceWorkers: "allow" });
  await standaloneContext.addInitScript(() => {
    const original = window.matchMedia.bind(window);
    window.matchMedia = (query) => {
      if (query.includes("display-mode")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addEventListener() {},
          removeEventListener() {},
          addListener() {},
          removeListener() {},
          dispatchEvent: () => false,
        };
      }
      return original(query);
    };
  });
  const p4 = await openPage(standaloneContext);
  const standaloneMatch = await p4.evaluate(() => window.matchMedia("(display-mode: standalone)").matches);
  await dispatchUntilBanner(p4);
  const bannerStandalone = await p4.getByText(BANNER_TEXT).count();
  report("Standalone: no install banner", standaloneMatch && bannerStandalone === 0, `display-mode:standalone=${standaloneMatch} banner=${bannerStandalone}`);
  await standaloneContext.close();

  // ── 5. Offline toast appears when the connection drops ──
  await p3.reload({ waitUntil: "load", timeout: 60000 });
  await p3.waitForTimeout(2000); // let hydration attach the offline listener
  await context.setOffline(true);
  const toast = await pollFor(async () => (await p3.getByText(TOAST_TEXT).count()) === 1, 6000);
  const onlineState = await p3.evaluate(() => navigator.onLine);
  report("Offline toast appears on disconnect", onlineState === false && toast, `navigator.onLine=${onlineState} toast=${toast}`);

  // ── 6. Back online: toast disappears ──
  await context.setOffline(false);
  const toastGone = await pollFor(async () => (await p3.getByText(TOAST_TEXT).count()) === 0, 6000);
  report("Offline toast hides when back online", toastGone, `toastGone=${toastGone}`);

  // ── 7. SW registration still active (regression guard) ──
  const sw = await p3.evaluate(async () => {
    try {
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000)),
      ]);
      return { state: reg.active ? reg.active.state : null };
    } catch (e) {
      return { error: String(e) };
    }
  });
  report("SW still registered", sw.state === "activated" || sw.state === "activating", JSON.stringify(sw));
  await p3.close();
} catch (err) {
  report("Script error", false, String(err).split("\n")[0]);
} finally {
  await context.setOffline(false).catch(() => {});
  await browser.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (consoleErrors.length) console.log("Console errors:", consoleErrors.slice(0, 5));
process.exit(failed.length ? 1 : 0);
