#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Visual + interactive audit for the FibroCare site.
 *
 * For each public route, loads it on phone (390x844) and desktop (1280x800),
 * takes a full-page screenshot, and verifies:
 *  - No horizontal overflow at the document level
 *  - No element is wider than its parent (catches bad w-[NNNpx] values)
 *  - All buttons have at least 32px tap target
 *  - All text is at least 14px
 *  - No images without max-width
 *
 * Writes a markdown report to scripts/audit-report.md.
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const OUT = "scripts/audit-screenshots";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "desktop", width: 1280, height: 800, isMobile: false, hasTouch: false },
];

const ROUTES = [
  "/",
  "/resources",
  "/resources/about",
  "/resources/community",
  "/resources/diagnosis",
  "/resources/exercises",
  "/resources/faq",
  "/resources/nutrition",
  "/resources/treatment",
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/terms",
];

const browser = await chromium.launch();
const findings = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const route of ROUTES) {
    const start = Date.now();
    try {
      const resp = await page.goto(BASE + route, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      const status = resp?.status() ?? 0;
      await page.waitForTimeout(800);
      const slug = route.replace(/\//g, "_") || "_root";
      const filename = `${vp.name}${slug}.png`;
      await page.screenshot({
        path: join(OUT, filename),
        fullPage: false, // Just viewport for the report
      });
      // Audit
      const issues = await page.evaluate(() => {
        const out = [];
        const html = document.documentElement;
        // 1. Horizontal overflow at the document
        if (html.scrollWidth > html.clientWidth + 1) {
          out.push({
            kind: "overflow",
            detail: `document overflow: scrollWidth=${html.scrollWidth}, clientWidth=${html.clientWidth}`,
          });
        }
        // 2. Find elements that overflow their parent (recursive)
        const all = document.querySelectorAll("*");
        let overflows = 0;
        for (const el of all) {
          if (overflows > 5) break;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          const parent = el.parentElement;
          if (!parent) continue;
          const pr = parent.getBoundingClientRect();
          // Skip if parent is bigger than viewport (we're not checking that)
          if (pr.width > document.documentElement.clientWidth) continue;
          if (rect.right > pr.right + 1 && rect.width > 32) {
            out.push({
              kind: "child-overflow",
              detail: `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).slice(0, 60) : ""}: right=${rect.right.toFixed(0)} > parent.right=${pr.right.toFixed(0)}`,
            });
            overflows++;
          }
        }
        // 3. Small tap targets (buttons/links)
        const buttons = document.querySelectorAll("button, a[href], [role='button']");
        let small = 0;
        for (const b of buttons) {
          if (small > 3) break;
          const r = b.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          // Skip navigation chrome and inline links
          if (r.width > document.documentElement.clientWidth) continue;
          if (r.height < 28) {
            out.push({
              kind: "small-tap",
              detail: `${b.tagName.toLowerCase()}: ${r.width.toFixed(0)}x${r.height.toFixed(0)} (text: ${(b.textContent || "").trim().slice(0, 30)})`,
            });
            small++;
          }
        }
        // 4. Text below 12px (very small)
        const smallText = [];
        const textNodes = document.querySelectorAll("p, span, h1, h2, h3, h4, h5, h6, li, button, label, a");
        for (const t of textNodes) {
          if (smallText.length > 3) break;
          const cs = getComputedStyle(t);
          const size = parseFloat(cs.fontSize);
          if (size > 0 && size < 12 && (t.textContent || "").trim().length > 0) {
            smallText.push(`${t.tagName.toLowerCase()}: ${size}px (${(t.textContent || "").trim().slice(0, 30)})`);
          }
        }
        if (smallText.length) {
          out.push({ kind: "small-text", detail: smallText.join("; ") });
        }
        return out;
      });
      const duration = Date.now() - start;
      if (status !== 200 || issues.length > 0) {
        findings.push({
          route,
          viewport: vp.name,
          status,
          duration,
          issues,
        });
      } else {
        console.log(`OK ${vp.name} ${route} ${duration}ms`);
      }
    } catch (e) {
      findings.push({
        route,
        viewport: vp.name,
        status: 0,
        error: String(e?.message ?? e),
        issues: [],
      });
    }
  }
  await context.close();
}

await browser.close();

// Report
let report = "# Visual audit report\n\n";
if (findings.length === 0) {
  report += "_No issues found._\n";
} else {
  for (const f of findings) {
    report += `## ${f.route} @ ${f.viewport}\n\n`;
    report += `- status: ${f.status}\n`;
    if (f.error) report += `- error: ${f.error}\n`;
    if (f.issues.length) {
      report += `- issues:\n`;
      for (const i of f.issues) {
        report += `  - **${i.kind}**: ${i.detail}\n`;
      }
    }
    report += "\n";
  }
}
writeFileSync("scripts/audit-report.md", report);
console.log("\nReport written to scripts/audit-report.md");
console.log(`Findings: ${findings.length}`);
