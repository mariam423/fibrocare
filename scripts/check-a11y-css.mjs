#!/usr/bin/env node
/**
 * Static accessibility guard for the FibroCare design system.
 *
 * Verifies that `src/app/globals.css` still ships the accessibility
 * escapes for the glass / 2.5D / motion identity:
 *   - prefers-reduced-transparency → ambient wash dropped, glass opaque
 *   - prefers-contrast: more        → ambient wash dropped
 *   - prefers-reduced-motion        → scroll-reveal never strands content
 *   - html.motion-reduce (manual kill switch) guards
 *
 * Runs automatically before every `next build` (prebuild hook) and is
 * deliberately dependency-free + fast so it never slows CI.
 *
 * Exit code 0 = pass, 1 = one or more guards are missing.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(root, "src", "app", "globals.css");

let css;
try {
  css = readFileSync(cssPath, "utf8");
} catch {
  console.error(`Cannot read ${cssPath}. The a11y CSS guard requires it.`);
  process.exit(1);
}

const checks = [
  {
    name: "prefers-reduced-transparency media query exists",
    pattern: /@media\s*\(prefers-reduced-transparency:\s*reduce\)/,
  },
  {
    name: "prefers-contrast: more media query exists",
    pattern: /prefers-contrast:\s*more/,
  },
  {
    name: ".ambient falls back to background: none",
    pattern: /\.ambient\s*\{[^}]*background:\s*none/,
  },
  {
    name: ".dark .ambient also falls back to none (specificity trap)",
    pattern:
      /prefers-reduced-transparency:\s*reduce[\s\S]{0,600}?\.dark\s+\.ambient\s*\{[^}]*background:\s*none/,
  },
  {
    name: ".glass-surface becomes opaque under reduced transparency",
    pattern:
      /prefers-reduced-transparency:\s*reduce[\s\S]{0,400}?\.glass-surface\s*\{[^}]*background:\s*var\(--card\)/,
  },
  {
    name: ".glass-surface drops backdrop-filter under reduced transparency",
    pattern:
      /prefers-reduced-transparency:\s*reduce[\s\S]{0,400}?\.glass-surface\s*\{[^}]*backdrop-filter:\s*none/,
  },
  {
    name: "@supports fallback for browsers without backdrop-filter",
    pattern: /@supports\s+not\s*\(/,
  },
  {
    name: "scroll-reveal reduced-motion guard (system preference)",
    pattern:
      /prefers-reduced-motion:\s*reduce[\s\S]{0,200}?\.animate-on-scroll/,
  },
  {
    name: "html.motion-reduce manual kill-switch guard for scroll-reveal",
    pattern: /html\.motion-reduce\s+\.animate-on-scroll/,
  },
];

let failed = 0;
for (const { name, pattern } of checks) {
  if (pattern.test(css)) {
    console.log(`  ✓ ${name}`);
  } else {
    console.error(`  ✗ ${name}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(
    `\nAccessibility CSS guard failed (${failed} missing). ` +
      "Restore these fallbacks in src/app/globals.css before building."
  );
  process.exit(1);
}
console.log("\nAccessibility CSS guards OK.");
