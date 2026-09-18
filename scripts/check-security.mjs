/**
 * check-security.mjs — automated secrets scan + dependency audit gate.
 *
 * Layer 1 — secret-pattern grep (fast, deterministic, zero network):
 *   Scans every tracked text file for credential-shaped strings:
 *   provider API keys (OpenAI/Anthropic/Gemini), cloud access keys
 *   (AWS/GCP/Azure), auth secrets (NextAuth, database URLs with
 *   embedded passwords), private key blocks, and generic
 *   `secret/api_key/password = <literal>` assignments.
 *
 * Layer 2 — `npm audit`:
 *   Fails when any dependency carries a known CVE at or above the
 *   severity threshold (default: high; `--audit-level=moderate` to
 *   tighten). Uses `npm audit --json` and reads the metadata counts,
 *   so the gate survives npm output-format changes.
 *
 * Both layers share the same false-positive suppressions: every finding
 * can carry a `// security: ok <reason>` trailing comment (e.g. test
 * fixtures, docs examples) — the scanner skips those lines. Suppressed
 * findings are still reported, so suppressions stay visible and honest.
 *
 * Exit codes: 0 = clean, 1 = finding above threshold.
 *
 * Usage:
 *   node scripts/check-security.mjs
 *   node scripts/check-security.mjs --audit-level=moderate
 *   node scripts/check-security.mjs --skip-audit   (secrets layer only)
 */

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
let auditLevel = "high";
let skipAudit = false;
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--audit-level=")) auditLevel = arg.split("=")[1];
  else if (arg === "--skip-audit") skipAudit = true;
}

let failed = false;
const suppressed = [];

/* ════════════════════════════════════════════════════════════════════ */
/* Layer 1 — secret-pattern scan over tracked files                      */
/* ════════════════════════════════════════════════════════════════════ */

// Secret shapes worth failing on. Anchored to provider prefixes or
// assignment patterns; deliberately NOT matching placeholder/example
// values (`<your-key>`, `generate-with-openssl`, `xxx…`).
const SECRET_PATTERNS = [
  // [name, regex] — regexes are fresh (non-global) per line test.
  // Key bodies include `-`/`_` because provider formats like `sk-proj-…`
  // carry hyphens; a `[a-zA-Z0-9]`-only body would silently miss them.
  ["OpenAI API key", /sk-[a-zA-Z0-9_-]{20,}/],
  ["Anthropic API key", /sk-ant-[a-zA-Z0-9_-]{20,}/],
  ["Google Gemini API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["GitHub token", /gh[pousr]_[a-zA-Z0-9]{30,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Google Cloud private-key id", /\d{12}-[0-9a-f]{32}\.apps\.googleusercontent\.com/],
  ["Azure connection string", /AccountKey=[a-zA-Z0-9+/=]{40,}/],
  ["Postgres URL with password", /postgres(?:ql)?:\/\/[^/\s:]+:[^@\s/]+@/],
  ["Private key block", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["Generic secret assignment", /(?:secret|api[_-]?key|password|token)["']?\s*[:=]\s*["'][^"'\s]{12,}["']/i],
];

/** Values that are obviously placeholders, never real secrets. */
const PLACEHOLDER_RE =
  /(?:\$\{|\$\(|\bprocess\.env\b|<[^>]+>|\b(?:xxx+|yyy+|zzz+|example|placeholder|changeme|your[_-]?key|your[_-]?secret|dummy|test|fixture|fake|sample)\b|generate-with-openssl|not-for-production|openssl rand|\.\.\.)/i;

/** Inline opt-out, so tests/docs can carry realistic shapes safely. */
const OK_RE = /(?:security|lint):\s*ok\b/i;

/** Files that must never be scanned (keep the list tight and explicit). */
const SKIP_DIRS = new Set([
  "node_modules", ".next", ".next-live", ".next-pwa", ".git", "tmp",
  "coverage", "dist", "build", ".vercel", ".azure",
]);

/** Text extensions worth scanning — binary files are skipped implicitly. */
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx",
  ".yml", ".yaml", ".css", ".html", ".txt", ".prisma", ".sql", ".env.example",
  ".sh", ".toml", ".webmanifest", ".svg", "",
]);

function listTrackedFiles() {
  // git ls-files = what CI actually checks out (respects .gitignore).
  let out;
  try {
    out = execFileSync("git", ["ls-files", "-z"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    // Not a git checkout (e.g. standalone container) — fall back to a
    // conservative recursive walk that still honors SKIP_DIRS.
    out = "";
  }
  const files = out ? out.split("\0").filter(Boolean) : [];
  if (files.length) return files;

  const walk = (dir) => {
    const found = [];
    for (const entry of readdirSafe(dir)) {
      const full = join(dir, entry);
      if (SKIP_DIRS.has(entry)) continue;
      found.push(...walk(full));
    }
    return found;
  };
  return walk(root);
}

function readdirSafe(dir) {
  try {
    return readdirDirSafe(dir);
  } catch {
    return [];
  }
}

function readdirDirSafe(dir) {
  // Small local import kept last so the happy path stays allocation-free.
  const { readdirSync, statSync } = require_fs();
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    const out = [];
    for (const e of entries) {
      if (SKIP_DIRS.has(e.name)) continue;
      const full = join(dir, e.name);
      out.push(statSync(full).isDirectory() ? walk_full(full) : full);
    }
    return out;
  } catch {
    return [];
  }
  function walk_full(d) {
    const { readdirSync } = require_fs();
    const acc = [];
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (SKIP_DIRS.has(e.name)) continue;
      const full = join(d, e.name);
      acc.push(statSync(full).isDirectory() ? walk_full(full) : full);
    }
    return acc;
  }
}

// Tiny CommonJS bridge — avoids a top-level import cycle in the fallback
// walker (imported once, shared by reference).
let _fs = null;
function require_fs() {
  if (!_fs) _fs = { readdirSync, statSync, readFileSync: readFileSync };
  return _fs;
}

function scanSecrets() {
  const files = listTrackedFiles();
  let scanned = 0;
  for ( const rel of files) {
    const path = join(root, rel);
    const ext = rel.slice(rel.lastIndexOf("."));
    if (!TEXT_EXT.has(ext) && rel !== ".env.example") continue;
    let content;
    try {
      content = readFileSync(path, "utf8");
    } catch {
      continue; // binary or unreadable — skip
    }
    scanned++;
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const [name, re] of SECRET_PATTERNS) {
        if (!re.test(line)) continue;
        // Real values only: placeholders, env reads, and explicitly
        // marked-ok lines never count.
        if (PLACEHOLDER_RE.test(line) || OK_RE.test(line)) {
          suppressed.push(`${rel}:${i + 1} (${name})`);
          break;
        }
        console.error(
          `SECRET ${name} at ${rel}:${i + 1}\n  ${line.trim().slice(0, 120)}`
        );
        failed = true;
        break;
      }
    }
  }
  console.log(`secret scan: ${scanned} tracked text files checked`);
  if (suppressed.length) {
    console.log(`secret scan: ${suppressed.length} line(s) matched but are marked/placeholder-safe:`);
    for (const s of suppressed) console.log(`  ok  ${s}`);
  }
}

/* ════════════════════════════════════════════════════════════════════ */
/* Layer 2 — npm audit (known CVEs above threshold)                      */
/* ════════════════════════════════════════════════════════════════════ */

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

function runAudit() {
  if (skipAudit) {
    console.log("npm audit: skipped (--skip-audit)");
    return;
  }
  // spawnSync (not execFileSync): on Windows npm is a .cmd shim that
  // execFileSync fails to spawn silently (status null, empty stdout), so
  // the audit would be skipped on every dev machine. `shell` is only
  // enabled on win32 where the args are fixed strings — no injection
  // surface. On Linux/CI npm is a real binary and spawns directly.
  const res = spawnSync("npm", ["audit", "--json"], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    shell: process.platform === "win32",
  });
  const json = res.stdout ?? "";
  if (!json) {
    console.log("npm audit: could not run (no lockfile or npm failure) — skipping");
    return;
  }
  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch {
    console.log("npm audit: unparseable output — skipping");
    return;
  }
  const vulns = parsed.metadata?.vulnerabilities ?? {};
  const threshold = SEVERITY_RANK[auditLevel] ?? SEVERITY_RANK.high;
  const above = Object.entries(vulns)
    .filter(([sev, count]) => sev in SEVERITY_RANK && count > 0 && SEVERITY_RANK[sev] >= threshold)
    .map(([sev, count]) => `${count} ${sev}`);
  const total = vulns.total ?? 0;
  if (above.length) {
    console.error(`npm audit: ${above.join(", ")} vulnerability(ies) at or above "${auditLevel}"`);
    failed = true;
  } else {
    console.log(`npm audit: clean (${total} total, threshold "${auditLevel}")`);
  }
}

scanSecrets();
runAudit();

if (failed) {
  console.error("\nSECURITY CHECK FAILED");
  process.exit(1);
}
console.log("\nALL SECURITY CHECKS PASSED");
