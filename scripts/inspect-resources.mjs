/* Diagnostic: resources page overlaps + modal contrast. Safe, read-only. */
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000";
const results = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  storageState: "e2e/.auth/user.json",
  serviceWorkers: "block",
});
const page = await ctx.newPage();

await page.goto(`${BASE}/resources`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);

// Find fixed-position elements currently in the lower half of the viewport.
const fixedLower = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed" && cs.position !== "absolute") continue;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.height === 0 || r.width === 0) continue;
    if (r.top < vh * 0.5 && r.bottom > vh * 0.5) {
      out.push({
        tag: el.tagName,
        cls: (el.className && String(el.className).slice(0, 90)) || "",
        pos: cs.position,
        z: cs.zIndex,
        rect: { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) },
      });
    }
  }
  return out.slice(0, 25);
});
results.push({ check: "fixed/absolute elements overlapping lower half", fixedLower });

// Screenshot at scroll bottom.
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
await page.screenshot({ path: "/tmp/resources-bottom-desktop.png", fullPage: false });

// Open the Sleep Hygiene modal (last card).
const cards = page.locator("text=Sleep Hygiene");
await cards.first().scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

const readMore = page.getByRole("button", { name: "Read More" }).nth(7);
await readMore.click({ timeout: 10000 }).catch(async () => {
  await page.getByRole("button", { name: "Read More" }).nth(7).click({ timeout: 10000 });
});
await page.getByRole("dialog").waitFor({ state: "visible", timeout: 15000 });
await page.waitForTimeout(500);
await page.screenshot({ path: "/tmp/resources-modal-desktop.png" });

const modalInfo = await page.evaluate(() => {
  const dlg = document.querySelector('[data-slot="dialog-content"]');
  if (!dlg) return null;
  const cs = getComputedStyle(dlg);
  const pick = (sel) => {
    const el = dlg.querySelector(sel);
    if (!el) return null;
    const s = getComputedStyle(el);
    return { text: (el.textContent || "").slice(0, 40), color: s.color, cls: el.className };
  };
  return {
    bg: cs.backgroundColor,
    color: cs.color,
    backdropFilter: cs.backdropFilter,
    title: pick("[data-slot=dialog-title]"),
    desc: pick("[data-slot=dialog-description]"),
    li: pick("li"),
    close: (() => {
      const el = dlg.querySelector("[data-slot=dialog-close]");
      if (!el) return null;
      const s = getComputedStyle(el);
      return { color: s.color, cls: el.className };
    })(),
  };
});
results.push({ check: "modal computed styles", modalInfo });

// Mobile viewport pass.
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState: "e2e/.auth/user.json",
  serviceWorkers: "block",
});
const mpage = await mctx.newPage();
await mpage.goto(`${BASE}/resources`, { waitUntil: "domcontentloaded" });
await mpage.waitForTimeout(2500);
await mpage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await mpage.waitForTimeout(600);
await mpage.screenshot({ path: "/tmp/resources-bottom-mobile.png" });

const mobileOverlap = await mpage.evaluate(() => {
  const out = [];
  const vh = window.innerHeight;
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    if (cs.position !== "fixed") continue;
    const r = el.getBoundingClientRect();
    if (r.height === 0 || r.width === 0) continue;
    if (r.top > vh * 0.6) {
      out.push({
        tag: el.tagName,
        cls: (el.className && String(el.className).slice(0, 90)) || "",
        z: cs.zIndex,
        rect: { top: Math.round(r.top), bottom: Math.round(r.bottom) },
      });
    }
  }
  return out.slice(0, 15);
});
results.push({ check: "mobile fixed elements in lower 40%", mobileOverlap });

await mctx.close();
await ctx.close();
await browser.close();

console.log(JSON.stringify(results, null, 2));
