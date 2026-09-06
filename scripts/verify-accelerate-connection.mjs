#!/usr/bin/env node
/**
 * Accelerate smoke-test.
 *
 * The Accelerate extension routes every query through Prisma's
 * edge-cached pooler, so a successful smoke-test confirms:
 *   1. `@prisma/extension-accelerate` is resolvable (via the
 *      createRequire path in `src/lib/prisma.ts`).
 *   2. `PRISMA_ACCELERATE_URL` points at a live Prisma Postgres
 *      connection (the URL is issued by the Prisma console and is
 *      what Accelerate needs to forward queries).
 *   3. The accelerated client can issue a simple query end-to-end.
 *
 * The script measures cold start (first query of the process) and
 * warm (subsequent queries) latency. A healthy Accelerate setup
 * should show:
 *   - cold start: 50–200ms (TLS handshake + first request to edge)
 *   - warm:       5–20ms  (cached at the edge after first miss)
 *
 * Counts are expected to be 0 because the Prisma Postgres instance
 * behind the Accelerate URL is a separate database from the Neon
 * one used by `verify-pg-connection.mjs`. The numbers themselves
 * are not the point — the connection is.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "..", "..");

const envPath = resolve(ROOT, ".env.production");
if (!existsSync(envPath)) {
  console.error(`[verify-accel] ${envPath} not found`);
  process.exit(1);
}
for (const raw of readFileSync(envPath, "utf8").split("\n")) {
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
  if (process.env[key] === undefined) process.env[key] = value;
}

if (!process.env.PRISMA_ACCELERATE_URL) {
  console.error("[verify-accel] PRISMA_ACCELERATE_URL is required");
  process.exit(1);
}

const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
const accelerateHost = (() => {
  try {
    return new URL(accelerateUrl).host;
  } catch {
    return "unknown";
  }
})();

console.log(`[verify-accel] Accelerate URL host: ${accelerateHost}`);

const { PrismaClient } = await import("@prisma/client");
const { withAccelerate } = await import("@prisma/extension-accelerate");

// Build a fresh client and wrap it. The same wrapping the runtime
// singleton does in `src/lib/prisma.ts` — we just inline it here
// because the smoke test must be self-contained and cannot rely
// on the singleton state.
//
// We use `$queryRaw` for the actual probe so the test works
// against any Postgres-flavored database behind the Accelerate
// URL, even one that has not had the Prisma migrations applied.
// The Prisma Postgres instance the Accelerate URL points at is
// a *separate* database from the Neon one — schema state on the
// two is not synchronised by this script.
const base = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: { url: accelerateUrl },
  },
});
const prisma = base.$extends(withAccelerate());

// Cold start: first query of the process. Includes TLS handshake,
// the first edge-cache miss, and the actual DB roundtrip.
const coldStart = Date.now();
let coldOk = 0;
let coldFail = 0;
const probes = [
  "SELECT 1 AS ok",
  "SELECT current_database() AS db",
  "SELECT version() AS version",
];

for (const sql of probes) {
  try {
    const rows = await prisma.$queryRawUnsafe(sql);
    console.log(`[verify-accel]  ✓ ${sql} →`, rows);
    coldOk++;
  } catch (err) {
    console.error(
      `[verify-accel]  ✗ ${sql}: ${err instanceof Error ? err.message : String(err)}`
    );
    coldFail++;
  }
}
const coldMs = Date.now() - coldStart;

// Warm: a second pass measures edge-cache hit latency. The same
// queries should be served by Accelerate's cache.
const warmStart = Date.now();
let warmOk = 0;
let warmFail = 0;
for (const sql of probes) {
  try {
    await prisma.$queryRawUnsafe(sql);
    warmOk++;
  } catch (err) {
    warmFail++;
  }
}
const warmMs = Date.now() - warmStart;

await prisma.$disconnect();

console.log("");
console.log(
  `[verify-accel] Cold start: ${coldMs}ms across ${probes.length} queries ` +
    `(${coldOk} ok, ${coldFail} failed)`
);
console.log(
  `[verify-accel] Warm pass:  ${warmMs}ms across ${probes.length} queries ` +
    `(${warmOk} ok, ${warmFail} failed)`
);
const warmPerQuery = (warmMs / probes.length).toFixed(1);
console.log(`[verify-accel] Warm per-query: ${warmPerQuery}ms`);

if (coldFail > 0 || warmFail > 0) {
  console.error("[verify-accel] FAIL");
  process.exit(1);
}
console.log("[verify-accel] OK");
