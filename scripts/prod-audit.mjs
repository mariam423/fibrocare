#!/usr/bin/env node
/**
 * prod-audit — build, serve, and audit the production bundle in one step.
 *
 *   npm run prod-audit
 *
 * Sequence:
 *   1. `next build` (includes the prebuild a11y CSS guard).
 *   2. `next start -p <port>` (default 3100 — the dev server usually owns
 *      3000). If a server is already responding on that port, it is
 *      reused and left running; otherwise it is started and always shut
 *      down afterwards (even if the audit fails).
 *   3. The runtime accessibility audit (scripts/a11y-audit.py) runs
 *      against that port with --full (authenticated pages included).
 *
 * Env overrides:
 *   AUDIT_PORT=<port>  change the port (default 3100)
 *   AUDIT_FULL=0       skip the authenticated (--full) portion
 *
 * Running the audit against `next start` (production) is stricter than
 * `npm run build:verify`, which audits the dev server: React does not log
 * hydration mismatches as console.error in production, so this gate has no
 * dev-only console noise.
 *
 * Exit code 0 = pass; nonzero = build, server, or audit failure.
 */
import { spawn, spawnSync } from "node:child_process";
import { openSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIT_SCRIPT = join(root, "scripts", "a11y-audit.py");
const GUARD_SCRIPT = join(root, "scripts", "check-a11y-css.mjs");
// next is a local dependency, so we drive it straight from this Node
// process (node <next-bin>) instead of shelling out to `npm` — spawning
// npm.cmd through a shell is flaky on Windows.
const NEXT_BIN = join(root, "node_modules", "next", "dist", "bin", "next");
const PORT = Number(process.env.AUDIT_PORT) || 3100;
const FULL = process.env.AUDIT_FULL !== "0";
const READY_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

const isWin = process.platform === "win32";

function findPython() {
  const candidates = isWin ? ["python", "python3"] : ["python3", "python"];
  for (const candidate of candidates) {
    try {
      const r = spawnSync(candidate, ["--version"], { stdio: "ignore" });
      if (r.status === 0) return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return isWin ? "python" : "python3";
}

async function portIsUp(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`, { redirect: "follow" });
    return res.status < 500; // 2xx/3xx = ready; 4xx/5xx = keep polling
  } catch {
    return false;
  }
}

async function waitReady(port) {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (await portIsUp(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

function killTree(proc) {
  if (!proc || proc.exitCode !== null || proc.signalCode !== null) return;
  try {
    if (isWin) {
      spawnSync("taskkill", ["/T", "/F", "/PID", String(proc.pid)], { stdio: "ignore" });
    } else if (proc.pid) {
      process.kill(-proc.pid, "SIGTERM"); // detached process group
    }
  } catch {
    try {
      proc.kill();
    } catch {
      /* already gone */
    }
  }
}

function build() {
  console.log("\n[prod-audit] 1/3 Building production bundle...");
  // npm run build would normally run this prebuild guard; since we drive
  // next directly, run it ourselves so the build gate stays intact.
  const guard = spawnSync(process.execPath, [GUARD_SCRIPT], { cwd: root, stdio: "inherit" });
  if (guard.status !== 0) process.exit(guard.status ?? 1);
  const r = spawnSync(process.execPath, [NEXT_BIN, "build"], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

async function main() {
  build();

  let server = null;
  if (await portIsUp(PORT)) {
    console.log(`[prod-audit] A server is already responding on :${PORT} — reusing it and leaving it running.`);
  } else {
    console.log(`[prod-audit] 2/3 Starting next start on :${PORT}...`);
    const logPath = join(tmpdir(), `fibrocare-prod-audit-${PORT}.log`);
    const logFd = openSync(logPath, "w");
    server = spawn(process.execPath, [NEXT_BIN, "start", "-p", String(PORT)], {
      cwd: root,
      stdio: ["ignore", logFd, logFd],
      detached: !isWin,
    });
    if (!(await waitReady(PORT))) {
      killTree(server);
      const tail = readFileSync(logPath, "utf8").split("\n").slice(-25).join("\n");
      console.error(
        `[prod-audit] next start did not become ready on :${PORT} within ${READY_TIMEOUT_MS / 1000}s.\nLast server log:\n${tail}`
      );
      process.exit(1);
    }
    console.log(`[prod-audit] Server ready on :${PORT} (logs -> ${logPath})`);
  }

  // Exit code is captured in a variable so the `finally` below always runs
  // (process.exit() inside the try would skip it and leak the server).
  let exitCode = 0;
  try {
    console.log(`[prod-audit] 3/3 Running a11y audit against :${PORT}${FULL ? " (--full)" : ""}...`);
    const auditArgs = [AUDIT_SCRIPT, "--port", String(PORT)];
    if (FULL) auditArgs.push("--full");
    // python is a real executable, so no shell needed here.
    const r = spawnSync(findPython(), auditArgs, { cwd: root, stdio: "inherit" });
    if (r.status !== 0) exitCode = r.status ?? 1;
  } finally {
    if (server) killTree(server);
  }

  if (exitCode !== 0) process.exit(exitCode);
  console.log("\n[prod-audit] Done — build + production a11y audit passed.");
}

main().catch((err) => {
  console.error("[prod-audit] Unexpected failure:", err);
  process.exit(1);
});
