#!/usr/bin/env node
/**
 * Shadow-mode (24h) enable / status / cutover / rollback for the Phase L
 * distributed adapters.
 *
 * The rollout rule (see `src/lib/featureFlags.ts` and `.env.example`):
 *
 *   - Adapters are OFF until BOTH the `USE_*` flag AND the credentials
 *     are set. Either alone is a no-op — this is what prevents an
 *     accidental cutover when env vars land on a preview deploy.
 *   - Shadow mode (`SHADOW_CACHE=1` / `SHADOW_RATELIMIT=1` + credentials)
 *     runs the Upstash adapter in parallel with the in-process primary
 *     for parity comparison. The in-process adapter still serves every
 *     response. This is the 24h validation window.
 *   - Cutover flips `USE_UPSTASH_CACHE=1`, `USE_UPSTASH_RATELIMIT=1`,
 *     and (when `PRISMA_ACCELERATE_URL` is set) `USE_ACCELERATE=1`, then
 *     clears the shadow flags.
 *
 * This script only edits `.env.production` (gitignored) — the file every
 * other Phase-L script (`db-migrate-pg.mjs`, `verify-*.mjs`) already
 * reads. It never touches the codebase or the running deployment; after a
 * successful run you must redeploy / restart so Next.js re-reads the env.
 *
 * Usage:
 *   node scripts/cutover.mjs                      # status (default)
 *   node scripts/cutover.mjs --status
 *   node scripts/cutover.mjs --enable-shadow      # start the 24h window
 *   node scripts/cutover.mjs --cutover            # flip to distributed
 *   node scripts/cutover.mjs --cutover --now      # skip the 24h gate
 *   node scripts/cutover.mjs --rollback           # back to in-process
 *   node scripts/cutover.mjs --help
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "..", "..");
const ENV_PATH = resolve(ROOT, ".env.production");

const VALIDATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const args = new Set(process.argv.slice(2));
const HELP = args.has("--help") || args.has("-h");
const FORCE = args.has("--now") || args.has("--force");

function log(msg) {
  console.log(`[cutover] ${msg}`);
}

function fail(msg) {
  console.error(`[cutover] ${msg}`);
  process.exit(1);
}

// ── .env.production read / write ─────────────────────────────────────
function loadLines() {
  if (!existsSync(ENV_PATH)) {
    fail(
      `${ENV_PATH} not found. Create it with your production credentials ` +
        "(DATABASE_URL, DIRECT_URL, UPSTASH_REDIS_REST_URL/TOKEN, " +
        "PRISMA_ACCELERATE_URL — see .env.example)."
    );
  }
  return readFileSync(ENV_PATH, "utf8").split("\n");
}

function parseVars(lines) {
  const vars = new Map();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars.set(key, value);
  }
  return vars;
}

/**
 * Apply a set of variable changes to the file.
 *
 * `set` maps key → value ("1"/"0"); `unset` is a list of keys to delete.
 * Existing `KEY=value` lines are replaced in place; new keys are appended
 * under a section comment. Comments and unrelated content are preserved.
 */
function writeVars(lines, setVars, unsetKeys) {
  const out = [];
  const handled = new Set();
  for (const raw of lines) {
    const trimmed = raw.trim();
    const isVarLine =
      !trimmed.startsWith("#") && trimmed.includes("=");
    let matched = false;
    if (isVarLine) {
      const key = trimmed.slice(0, trimmed.indexOf("=")).trim();
      if (setVars.has(key)) {
        out.push(`${key}=${setVars.get(key)}`);
        handled.add(key);
        matched = true;
      } else if (unsetKeys.includes(key)) {
        // Delete the flag line entirely (the file keeps its comments).
        matched = true;
      }
    }
    if (!matched) out.push(raw);
  }

  // Append any new keys in a grouped, commented block.
  const toAdd = [];
  for (const [key, value] of setVars) {
    if (!handled.has(key)) toAdd.push(`${key}=${value}`);
  }
  if (toAdd.length > 0) {
    if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");
    out.push("# ── Phase L rollout state (managed by scripts/cutover.mjs) ──");
    out.push(...toAdd);
  }
  writeFileSync(ENV_PATH, out.join("\n").replace(/\n+$/, "") + "\n");
}

// ── Derived state ────────────────────────────────────────────────────
function readState() {
  const lines = loadLines();
  const vars = parseVars(lines);
  const now = Date.now();

  const upstashCreds = Boolean(
    vars.get("UPSTASH_REDIS_REST_URL") && vars.get("UPSTASH_REDIS_REST_TOKEN")
  );
  const accelerateUrl = vars.get("PRISMA_ACCELERATE_URL");

  const flag = (useKey, shadowKey, label) => {
    const use = vars.get(useKey) === "1";
    const shadow = vars.get(shadowKey) === "1";
    if (use) return { mode: "cutover", label: `${label}: Upstash (CUTOVER)` };
    if (shadow && upstashCreds)
      return { mode: "shadow", label: `${label}: in-process + Upstash shadow` };
    if (shadow && !upstashCreds)
      return { mode: "misconfigured", label: `${label}: SHADOW flag without Upstash creds` };
    return { mode: "off", label: `${label}: in-process (off)` };
  };

  const cache = flag("USE_UPSTASH_CACHE", "SHADOW_CACHE", "cache");
  const ratelimit = flag("USE_UPSTASH_RATELIMIT", "SHADOW_RATELIMIT", "rate limit");
  const accelerate = vars.get("USE_ACCELERATE") === "1"
    ? { mode: "cutover", label: "Accelerate: ON" }
    : accelerateUrl
      ? { mode: "off", label: "Accelerate: direct (off)" }
      : { mode: "off", label: "Accelerate: direct (no URL set)" };

  const startedRaw = vars.get("SHADOW_STARTED_AT");
  let startedMs = null;
  if (startedRaw) {
    const parsed = Number(startedRaw) || Date.parse(startedRaw);
    if (!Number.isNaN(parsed)) startedMs = parsed;
  }

  return { vars, lines, now, upstashCreds, accelerateUrl, cache, ratelimit, accelerate, startedMs };
}

function formatHours(ms) {
  return (ms / 3_600_000).toFixed(1);
}

function requireWindowElapsed(state) {
  if (!state.startedMs) {
    fail(
      "No shadow start timestamp found. Run `node scripts/cutover.mjs " +
        "--enable-shadow` first — the 24h validation window is measured from that moment."
    );
  }
  const elapsed = state.now - state.startedMs;
  if (elapsed < VALIDATION_WINDOW_MS) {
    const remaining = VALIDATION_WINDOW_MS - elapsed;
    fail(
      `Validation window not complete: ${formatHours(elapsed)}h of 24h elapsed. ` +
        `Wait ${formatHours(remaining)}h more, or rerun with --now to override.`
    );
  }
}

// ── Actions ──────────────────────────────────────────────────────────
function showStatus(state) {
  log("─ Phase L rollout status ─");
  log(state.cache.label);
  log(state.ratelimit.label);
  log(state.accelerate.label);
  log(`Upstash credentials present: ${state.upstashCreds ? "yes" : "no"}`);
  log(`PRISMA_ACCELERATE_URL present: ${state.accelerateUrl ? "yes" : "no"}`);
  if (state.startedMs) {
    const elapsed = state.now - state.startedMs;
    const complete = elapsed >= VALIDATION_WINDOW_MS;
    log(
      `Shadow window started: ${new Date(state.startedMs).toISOString()} ` +
        `(${formatHours(Math.max(0, elapsed))}h of 24h ` +
        `${complete ? "— complete ✓" : "elapsed"})`
    );
    if (!complete) {
      log(
        `Cutover is gated until ${formatHours(VALIDATION_WINDOW_MS - elapsed)}h more ` +
          `have passed (use --cutover --now to override).`
      );
    }
  } else {
    log("Shadow window: not started (run --enable-shadow).");
  }

  const blockers = [];
  if (state.cache.mode === "misconfigured") blockers.push("SHADOW_CACHE=1 but no Upstash creds");
  if (state.ratelimit.mode === "misconfigured") blockers.push("SHADOW_RATELIMIT=1 but no Upstash creds");
  if (blockers.length > 0) {
    log(`⚠ Misconfiguration: ${blockers.join("; ")} — shadow is NOT running.`);
  }
}

function enableShadow(state) {
  const cutoverAlready = state.cache.mode === "cutover" || state.ratelimit.mode === "cutover";
  if (cutoverAlready && !FORCE) {
    fail(
      "USE_UPSTASH_* is already 1 (cutover done). Shadow validates the PRE-cutover state; " +
        "run --rollback first if you meant to re-enter validation, or use --force to set " +
        "the flags anyway (they will be ignored until rolled back)."
    );
  }
  if (!state.upstashCreds) {
    fail(
      "Cannot enable shadow without UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN " +
        "in .env.production."
    );
  }

  const set = new Map([
    ["SHADOW_CACHE", "1"],
    ["SHADOW_RATELIMIT", "1"],
  ]);
  if (!state.startedMs) {
    set.set("SHADOW_STARTED_AT", String(Date.now()));
  }
  writeVars(state.lines, set, []);
  const fresh = readState();
  log("Shadow mode enabled (in-process serves; Upstash runs in parallel).");
  log(
    `Window started: ${fresh.startedMs ? new Date(fresh.startedMs).toISOString() : "n/a"}. ` +
      `Redeploy / restart so Next.js re-reads the env.`
  );
  log(
    "For the next 24h watch /api/health (shadow counters `shadow_cache_*`, " +
      "`shadow_ratelimit_*`). When the window closes, run: node scripts/cutover.mjs --cutover"
  );
}

function cutover(state) {
  if (state.cache.mode !== "shadow" && state.ratelimit.mode !== "shadow") {
    fail(
      "Shadow mode is not running. Run `node scripts/cutover.mjs --enable-shadow` and " +
        "let the 24h window pass before cutting over."
    );
  }
  if (!FORCE) requireWindowElapsed(state);

  const set = new Map([
    ["USE_UPSTASH_CACHE", "1"],
    ["USE_UPSTASH_RATELIMIT", "1"],
  ]);
  if (state.accelerateUrl) set.set("USE_ACCELERATE", "1");

  const unset = ["SHADOW_CACHE", "SHADOW_RATELIMIT", "SHADOW_STARTED_AT"];
  writeVars(state.lines, set, unset);
  log("Cutover applied to .env.production:");
  log("  USE_UPSTASH_CACHE=1, USE_UPSTASH_RATELIMIT=1" + (state.accelerateUrl ? ", USE_ACCELERATE=1" : ""));
  log("  shadow flags cleared.");
  if (!state.accelerateUrl) {
    log("  (USE_ACCELERATE not set: PRISMA_ACCELERATE_URL is absent — skip Accelerate or add it first.)");
  }
  log("Next: redeploy / restart, then verify:");
  log("  node scripts/verify-accelerate-runtime.mjs");
  log("  node scripts/verify-accelerate-connection.mjs");
  log("  curl -H 'x-admin-token: $ADMIN_METRICS_TOKEN' <origin>/api/health");
}

function rollback(state) {
  const set = new Map();
  if (!state.upstashCreds) {
    // Nothing to shadow with — plain rollback to in-process.
    log("Upstash credentials absent; rolling straight back to in-process.");
  } else {
    set.set("SHADOW_CACHE", "1");
    set.set("SHADOW_RATELIMIT", "1");
    if (!state.startedMs) set.set("SHADOW_STARTED_AT", String(Date.now()));
    else set.set("SHADOW_STARTED_AT", String(state.startedMs));
  }
  writeVars(state.lines, set, [
    "USE_UPSTASH_CACHE",
    "USE_UPSTASH_RATELIMIT",
    "USE_ACCELERATE",
  ]);
  log(
    "Rollback applied: USE_* cleared — in-process cache/rate limit and direct Prisma " +
      (state.upstashCreds
        ? "restored, with shadow monitoring re-enabled."
        : "restored.")
  );
  log("Next: redeploy / restart to take effect.");
}

// ── CLI ──────────────────────────────────────────────────────────────
if (HELP) {
  console.log(`Usage: node scripts/cutover.mjs [command]

Commands:
  (none) | --status       Show the current rollout state and 24h-gate clock
  --enable-shadow         Start the 24h validation window (SHADOW_*=1)
  --cutover [--now]       Flip USE_UPSTASH_*=1 (+ USE_ACCELERATE=1 when the
                          URL is set) after 24h of shadow; --now overrides
  --rollback              Clear USE_* — back to in-process + direct
  --help                  This help

It edits ONLY .env.production (gitignored). Redeploy after any change.`);
  process.exit(0);
}

const state = readState();

if (args.has("--enable-shadow")) {
  enableShadow(state);
} else if (args.has("--cutover") || args.has("--apply")) {
  cutover(state);
} else if (args.has("--rollback")) {
  rollback(state);
} else {
  showStatus(state);
}
