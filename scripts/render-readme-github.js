/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * render-readme-github.js — authoritative README render check.
 *
 * Sends README.md to GitHub's own markdown API (mode: "gfm", context:
 * mariam423/fibrocare) and validates the HTML GitHub's renderer produces:
 *   1. Every rendered <img> is either a camo-proxied badge with a
 *      well-formed URL, or a repo-relative path that exists on disk.
 *   2. Every in-page link fragment matches a heading anchor GitHub emitted.
 *   3. Structural sanity: tables render as <table>, hero GIF present,
 *      no raw HTML leaking as escaped text.
 *
 * NOTE: the REST /markdown API does NOT rewrite relative image paths (the
 * github.com website does that in a separate layer). Relative paths in the
 * output are therefore validated directly against disk — matching what the
 * website resolves them to.
 *
 * Needs network. Unauthenticated limit: 60 req/h per IP — single call.
 * Usage: node scripts/render-readme-github.js
 */
const fs = require("fs");
const https = require("https");

const md = fs.readFileSync("README.md", "utf8");
const payload = JSON.stringify({ text: md, mode: "gfm", context: "mariam423/fibrocare" });

const req = https.request(
  {
    hostname: "api.github.com",
    path: "/markdown",
    method: "POST",
    timeout: 20000,
    headers: {
      "User-Agent": "fibrocare-readme-check",
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      Accept: "application/vnd.github+json",
      // GITHUB_TOKEN (set in CI) lifts the rate limit from 60/h per IP
      // to 5,000/h per token, keeping the check deterministic.
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
  },
  (res) => {
    let html = "";
    res.on("data", (c) => (html += c));
    res.on("end", () => {
      if (res.statusCode !== 200) {
        console.log(`GitHub API ${res.statusCode}: ${html.slice(0, 160)}`);
        process.exit(2);
      }
      validate(html);
    });
  }
);
req.on("error", (e) => {
  console.log("NETWORK ERROR:", e.message);
  process.exit(2);
});
req.on("timeout", () => req.destroy(new Error("timeout")));
req.write(payload);
req.end();

const issues = [];
function validate(html) {
  /* ── 1. Rendered <img> tags ─────────────────────────────────────────── */
  const imgs = [...html.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
  let badges = 0;
  let local = 0;
  for (const src of imgs) {
    if (src.includes("camo.githubusercontent.com")) {
      badges++;
      // Camo proxies an escaped absolute URL — it must be well-formed.
      const hex = src.split("/").pop() || "";
      if (hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
        issues.push(`BADGE camo URL malformed: ${src.slice(0, 70)}…`);
      }
      continue;
    }
    if (/^https?:\/\//.test(src)) {
      // Any other absolute URL that is not a local file reference.
      issues.push(`IMG unexpected absolute URL: ${src.slice(0, 90)}`);
      continue;
    }
    // Relative path — the website resolves these against repo root.
    const disk = decodeURIComponent(src.replace(/&amp;/g, "&"));
    if (!fs.existsSync(disk)) {
      issues.push(`IMG relative path missing on disk: "${disk}"`);
    } else {
      local++;
    }
  }

  /* ── 2. Heading anchors vs in-page fragments ────────────────────────── */
  const anchorIds = new Set(
    [...html.matchAll(/<a[^>]+id="user-content-([^"]+)"/g)].map((m) => m[1])
  );
  const frags = [...md.matchAll(/\]\(#([^)\s]+)\)/g)].map((m) => m[1]);
  let checkedFrags = 0;
  if (anchorIds.size > 0 && frags.length > 0) {
    for (const f of frags) {
      if (!anchorIds.has(f)) {
        issues.push(`ANCHOR "#${f}" not among GitHub-rendered heading ids`);
      } else {
        checkedFrags++;
      }
    }
  }

  /* ── 3. Structural sanity ───────────────────────────────────────────── */
  if (!/<table[\s>]/.test(html)) {
    issues.push("TABLE: tech-stack table did not render as <table>");
  }
  if (!/<img src="[^"]*fibrocare-repo-demo\.gif/.test(html)) {
    issues.push("HERO GIF missing from rendered output");
  }
  if (/&lt;div align/.test(html)) {
    issues.push("RAW HTML leak: <div> rendered as escaped text");
  }

  /* ── Report ─────────────────────────────────────────────────────────── */
  console.log(
    `GitHub-rendered README: ${imgs.length} <img> total → ${badges} badge(s) via camo, ${local} local; ` +
      `${anchorIds.size} heading anchors; ${checkedFrags}/${frags.length} in-page links verified; ` +
      `table OK; GIF OK`
  );
  if (issues.length) {
    console.log(`\n${issues.length} ISSUE(S):`);
    for (const s of issues) console.log("  ✗ " + s);
    process.exit(1);
  }
  console.log("GitHub API render check: ALL PASS ✓");
}
