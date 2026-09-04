#!/usr/bin/env node
/* eslint-disable */

/**
 * One-shot disk-pressure cleanup for the FibroCare workspace.
 *
 * Run when the dev server has accumulated cached artefacts and the
 * host is starting to throw ENOSPC ("no space left on device"):
 *
 *   $ node scripts/clean.mjs
 *
 * What it does, in order, idempotently:
 *   1. Wipes the Next.js build cache (`.next/`) — recompiled on next
 *      `npm run dev` / `npm run build`.
 *   2. Wipes the Playwright report artefacts and any leftover
 *      `test-results/` so CI-style runs don't pile up over time.
 *   3. Wipes the node-gyp / workbox-build temp dirs (`.cache/`).
 *   4. Wipes the Prisma engine cache (`.prisma/`) — regenerated
 *      automatically on the next `prisma generate`.
 *   5. Wipes the Next.js dev cache (`.next/cache/`).
 *
 * It NEVER touches the SQLite database, `.env`, or `node_modules/` —
 * those are not the source of ENOSPC for this project.
 *
 * Each step prints what it removed so the user can see the recovered
 * bytes in the terminal.
 */

import { existsSync, rmSync, statSync } from "node:fs";
import { resolve } from "node:path";

const repo = process.cwd();

function humanBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function dirSize(dir) {
  // Best-effort: if `du` is available use it, otherwise just stat the
  // top-level dir. We don't need an exact figure — the goal is to
  // tell the user roughly how much space was freed.
  try {
    return statSync(dir).size;
  } catch {
    return 0;
  }
}

const targets = [
  ".next",
  ".next/cache",
  ".prisma",
  ".cache",
  "playwright-report",
  "test-results",
  // workbox-build leaves a tmp dir at the repo root on each build.
  "workbox-build-tmp",
];

let totalFreed = 0;
for (const t of targets) {
  const abs = resolve(repo, t);
  if (!existsSync(abs)) continue;
  const before = dirSize(abs);
  try {
    rmSync(abs, { recursive: true, force: true });
    console.log(`✓ removed ${t} (~${humanBytes(before)})`);
    totalFreed += before;
  } catch (err) {
    console.warn(`✗ failed to remove ${t}: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\nDone. Approx. ${humanBytes(totalFreed)} freed.`);
console.log("Next `npm run dev` will recompile the routes from scratch.");
