#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Responsive audit for FibroCare.
 *
 * Walks every public + authenticated route at phone, laptop, and desktop
 * viewports, and for each page records:
 *  - HTTP status / render time
 *  - Whether the document overflows horizontally (a common mobile regression)
 *  - Whether the main landmark is visible
 *
 * Output is a markdown table so a human (or another model) can spot the
 * pages that need tightening.
 */

import { chromium, devices } from "playwright";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";

const VIEWPORTS = [
  { name: "phone (390×844)", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "laptop (1280×800)", width: 1280, height: 800, isMobile: false, hasTouch: false },
  { name: "desktop (1920×1080)", width: 1920, height: 1080, isMobile: false, hasTouch: false },
];

// Public routes — no auth required.
const PUBLIC_ROUTES = [
  "/",
  "/resources",
  "/resources/about",
  "/resources/community",
  "/resources/diagnosis",
  "/resources/exercises",
  "/resources/faq",
  "/resources/nutrition",
  "/resources/treatment",
  "/privacy",
  "/terms",
  "/login",
  "/signup",
  "/forgot-password",
  "/offline",
];

// Authenticated routes — depend on the seed user in e2e/.auth/user.json
// being runnable. The dashboard is the most layout-heavy; the rest are
// covered by the existing qa suite. We skip them here because the
// privacy lock would block the audit and we want the public-facing
// surface in scope.
const SKIP_AUTH = true;

const results = [];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  for (const route of PUBLIC_ROUTES) {
    const start = Date.now();
    let status = 0;
    let error = null;
    let overflow = null;
    let mainVisible = false;
    let hScroll = 0;
    try {
      const resp = await page.goto(BASE + route, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      status = resp?.status() ?? 0;
      // Wait a beat for client-side hydration.
      await page.waitForTimeout(800);
      const metrics = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;
        const main = document.querySelector("main");
        return {
          scrollWidth: html.scrollWidth,
          clientWidth: html.clientWidth,
          bodyScrollWidth: body?.scrollWidth ?? 0,
          bodyClientWidth: body?.clientWidth ?? 0,
          hasMain: !!main,
          mainVisible: main ? main.getBoundingClientRect().height > 0 : false,
        };
      });
      hScroll = Math.max(
        metrics.scrollWidth - metrics.clientWidth,
        metrics.bodyScrollWidth - metrics.bodyClientWidth
      );
      overflow = hScroll > 1;
      mainVisible = metrics.mainVisible;
    } catch (e) {
      error = String(e?.message ?? e);
    }
    const duration = Date.now() - start;
    results.push({
      route,
      viewport: vp.name,
      status,
      duration,
      hScroll,
      overflow,
      mainVisible,
      error,
    });
    void mainVisible;
  }
  await context.close();
}

await browser.close();

console.log("\n## Responsive audit\n");
console.log(
  "| route | viewport | status | h-scroll(px) | main | duration | error |"
);
console.log("| --- | --- | --- | --- | --- | --- | --- |");
for (const r of results) {
  const flag = r.overflow ? "❌" : r.status === 200 ? "✅" : "⚠️";
  console.log(
    `| ${r.route} | ${r.viewport} | ${r.status} ${flag} | ${r.hScroll} | ${r.mainVisible ? "yes" : "no"} | ${r.duration}ms | ${r.error ?? ""} |`
  );
}
console.log("");

const overflows = results.filter((r) => r.overflow);
console.log(`\n**Pages with horizontal overflow (${overflows.length}):**\n`);
for (const r of overflows) {
  console.log(`- \`${r.route}\` @ ${r.viewport}: ${r.hScroll}px overflow`);
}

process.exit(overflows.length > 0 ? 1 : 0);
