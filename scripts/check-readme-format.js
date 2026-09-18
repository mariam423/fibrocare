/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * check-readme-format.js — README.md GitHub-render sanity check.
 *
 * Validates what GitHub actually renders, not what we typed:
 *   1. Badge/image URLs contain no raw spaces (CommonMark breaks on
 *      unescaped spaces inside inline link destinations).
 *   2. Every heading anchor matches github-slugger output — the exact
 *      slug algorithm GitHub uses for #fragment links.
 *   3. Local image/link targets exist on disk.
 *   4. HTML tags are balanced after flattening inline code spans.
 *   5. Table row pipe counts are consistent per table.
 */
const fs = require("fs");
const GithubSlugger = require("github-slugger").default;

// Target file defaults to README.md; pass a path to check another doc
// (e.g. `node scripts/check-readme-format.js FEATURES.md`).
const file = process.argv[2] ?? "README.md";
const md = fs.readFileSync(file, "utf8");
const issues = [];
let okCount = 0;

/* ── 1. Badge/image URLs: raw spaces in destinations ───────────────────── */
const inlineImgRe = /!\[([^\]]*)\]\(([^)\s]+(?:\s[^)\s]+)*)\s*\)/g;
let m;
while ((m = inlineImgRe.exec(md)) !== null) {
  const dest = m[2];
  if (dest.startsWith("http")) {
    if (/\s/.test(dest)) {
      issues.push(
        `BADGE raw space in URL (GitHub won't render): "${dest.slice(0, 70)}…"`
      );
    } else {
      okCount++;
    }
  } else {
    // Local target — check existence (decode %20 etc.)
    const p = decodeURIComponent(dest.split(" ")[0]);
    if (!fs.existsSync(p)) {
      issues.push(`IMAGE missing on disk: "${dest}"`);
    } else {
      okCount++;
    }
  }
}

/* ── 2. Heading anchors via github-slugger (GitHub's algorithm) ────────── */
const slugger = new GithubSlugger();
const anchors = new Map();
const headingRe = /^(#{1,6})\s+(.+?)\s*#*$/gm;
while ((m = headingRe.exec(md)) !== null) {
  const text = m[2]
    .replace(/`([^`]*)`/g, "$1") // strip inline code backticks
    .replace(/[*_~]/g, ""); // strip emphasis markers
  const slug = slugger.slug(text);
  const count = anchors.get(slug) || 0;
  anchors.set(slug, count + 1);
}
// Duplicate headings get -1, -2 suffixes on GitHub; record base + suffixed
const validFragments = new Set();
for (const [slug, count] of anchors) {
  validFragments.add(slug);
  for (let i = 1; i < count; i++) validFragments.add(`${slug}-${i}`);
}

const linkRe = /\[[^\]]+\]\(#([^)]+)\)/g;
while ((m = linkRe.exec(md)) !== null) {
  const frag = m[1];
  if (!validFragments.has(frag)) {
    issues.push(`ANCHOR broken: "#${frag}" (no heading generates this slug)`);
  } else {
    okCount++;
  }
}

/* ── 3. Local link targets exist ───────────────────────────────────────── */
// Links may carry a #fragment (e.g. ./docs/X.md#section): only the path
// part is checked against disk, and — when the target is a local markdown
// file with its own heading anchors — the fragment is validated against
// that file's github-slugger slugs. Cross-file anchor links are the
// classic silent breakage: the path exists, the fragment doesn't.
const mdLinkRe = /\[[^\]]+\]\((?!#|http)([^)]+)\)/g;
while ((m = mdLinkRe.exec(md)) !== null) {
  const raw = m[1].split(" ")[0];
  const hashIdx = raw.indexOf("#");
  const p = decodeURIComponent(hashIdx === -1 ? raw : raw.slice(0, hashIdx));
  if (!fs.existsSync(p)) {
    issues.push(`LINK missing on disk: "${m[1]}"`);
    continue;
  }
  if (hashIdx === -1 || !/\.mdx?$/i.test(p)) {
    okCount++;
    continue;
  }
  const frag = decodeURIComponent(raw.slice(hashIdx + 1));
  const target = fs.readFileSync(p, "utf8");
  const targetSlugger = new GithubSlugger();
  const targetFragments = new Set();
  const targetHeadingRe = /^(#{1,6})\s+(.+?)\s*#*$/gm;
  const th = {};
  while ((th.m = targetHeadingRe.exec(target)) !== null) {
    const slug = targetSlugger.slug(
      th.m[2].replace(/`([^`]*)`/g, "$1").replace(/[*_~]/g, "")
    );
    targetFragments.add(slug);
  }
  if (!targetFragments.has(frag)) {
    issues.push(`ANCHOR cross-file broken: "${raw}" (no heading in ${p} generates #${frag})`);
  } else {
    okCount++;
  }
}

/* ── 4. HTML tag balance on flattened markdown ─────────────────────────── */
// Remove fenced code blocks, then inline code spans, then strip text nodes
// so only tags remain.
const flat = md
  .replace(/```[\s\S]*?```/g, "")
  .replace(/`[^`\n]*`/g, "");
const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const voids = new Set([
  "br", "hr", "img", "input", "kbd", "wbr", "picture", "source",
]);
const stack = [];
const selfClosing = /\/\s*$/;
let tag;
while ((tag = tagRe.exec(flat)) !== null) {
  const name = tag[1].toLowerCase();
  if (voids.has(name) || selfClosing.test(tag[2])) continue;
  if (tag[0].startsWith("</")) {
    const top = stack[stack.length - 1];
    if (top === name) {
      stack.pop();
    } else {
      issues.push(
        `HTML mismatch: closing </${name}> but open stack top is <${top || "none"}>`
      );
      // attempt recovery
      const idx = stack.lastIndexOf(name);
      if (idx >= 0) stack.length = idx;
    }
  } else {
    stack.push(name);
  }
}
for (const unclosed of stack) {
  issues.push(`HTML unclosed: <${unclosed}>`);
}

/* ── 5. Table pipe consistency ─────────────────────────────────────────── */
const lines = md.split("\n");
let tblStart = -1;
let tblCols = 0;
for (let i = 0; i <= lines.length; i++) {
  const line = lines[i] || "";
  const isRow = /^\s*\|.*\|\s*$/.test(line);
  if (isRow && tblStart === -1) {
    tblStart = i;
    tblCols = (line.match(/\|/g) || []).length;
  } else if (!isRow && tblStart !== -1) {
    // table ended at i-1; verify each row
    for (let j = tblStart; j < i; j++) {
      const c = (lines[j].match(/\|/g) || []).length;
      if (c !== tblCols) {
        issues.push(
          `TABLE row ${j + 1}: ${c} pipes vs header ${tblCols} — "${lines[j].slice(0, 50)}…"`
        );
      }
    }
    tblStart = -1;
  }
}

/* ── Report ────────────────────────────────────────────────────────────── */
console.log(`Checked: ${md.length} chars, ${anchors.size} headings, ` +
  `${okCount} paths/badges OK`);
if (issues.length) {
  console.log(`\n${issues.length} ISSUE(S):`);
  for (const s of issues) console.log("  ✗ " + s);
  process.exit(1);
}
console.log("README GitHub-format check: ALL PASS ✓");
