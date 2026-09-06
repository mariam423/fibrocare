#!/usr/bin/env node
/**
 * One-shot verification that the Prisma client can:
 *  1. Connect to the configured Neon database.
 *  2. List every model that the schema declares.
 *  3. Read row counts for the user-facing models. The counts should
 *     all be 0 on a fresh database — anything else means the
 *     previous migration is in an unexpected state.
 *
 * This is a smoke test, not a test suite. Run once after
 * `db:migrate:pg` to confirm the deploy worked, then leave alone.
 *
 * Why a standalone PrismaClient and not the runtime singleton from
 * `src/lib/prisma.ts`: the runtime singleton is generated for
 * SQLite (the active dev schema) — for an out-of-band smoke test
 * we instantiate a fresh client here that targets the same
 * generated client file but bypasses the lazy-singleton wrapping
 * (the runtime client is feature-flagged to wrap with Accelerate
 * when `USE_ACCELERATE=1`; the smoke test must always use the
 * bare client to be sure the connection itself works).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "..", "..");

const envPath = resolve(ROOT, ".env.production");
if (!existsSync(envPath)) {
  console.error(`[verify-pg] ${envPath} not found`);
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

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient({
  log: ["error", "warn"],
});

const models = [
  "user",
  "subscription",
  "session",
  "passwordResetToken",
  "painLog",
  "symptomLog",
  "doctorPost",
  "articleReaction",
  "consultation",
  "consultationMessage",
];

let okCount = 0;
let failCount = 0;

console.log(`[verify-pg] Connecting to ${new URL(process.env.DATABASE_URL).host}`);

for (const model of models) {
  try {
    const count = await prisma[model].count();
    console.log(`[verify-pg]  ✓ ${model}: ${count} rows`);
    okCount++;
  } catch (err) {
    console.error(
      `[verify-pg]  ✗ ${model}: ${err instanceof Error ? err.message : String(err)}`
    );
    failCount++;
  }
}

await prisma.$disconnect();
console.log(
  `[verify-pg] Done: ${okCount} ok, ${failCount} failed (out of ${models.length})`
);
process.exit(failCount === 0 ? 0 : 1);
