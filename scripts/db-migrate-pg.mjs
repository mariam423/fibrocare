#!/usr/bin/env node
/**
 * Apply Postgres migrations to the Neon database.
 *
 * Why this script:
 *  - `prisma migrate deploy --schema prisma-pg/schema.prisma` only
 *    accepts the schema path; it does not have an --env-file flag.
 *  - The active `.env` is SQLite-flavored (local dev), so we cannot
 *    reuse it. Production envs must come from a separate file.
 *  - We load `.env.production` (gitignored) and pass DATABASE_URL and
 *    DIRECT_URL through to the Prisma CLI as env vars on the same
 *    process. The Prisma CLI's `migrate deploy` reads DATABASE_URL
 *    from `process.env`, so the override is transparent.
 *
 * Usage:
 *   node scripts/db-migrate-pg.mjs              # apply pending
 *   node scripts/db-migrate-pg.mjs --status     # show status only
 *   node scripts/db-migrate-pg.mjs --verify     # verify the DB
 *                                                # matches the
 *                                                # latest migration
 *
 * Required env vars (in .env.production):
 *   DATABASE_URL    Neon pooled connection string
 *   DIRECT_URL      Neon direct connection string (unpooled)
 *
 * On a fresh database, the script will:
 *   1. Apply the initial migration (CREATE TABLE for every model).
 *   2. Record the migration in the _prisma_migrations table.
 *   3. Print a one-line summary per applied migration.
 *
 * On an up-to-date database, the script is a no-op and exits 0.
 *
 * If a migration is in a "failed" state, the script marks it
 * "rolled back" (via `prisma migrate resolve --rolled-back`) and
 * re-runs `migrate deploy`. This is safe because every migration in
 * this repo is written to be idempotent (`IF NOT EXISTS` guards), so
 * a previously-failed migration can be re-applied without damaging
 * already-created columns/tables.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "..", "..");

function loadEnvFile(path) {
  if (!existsSync(path)) {
    // Running inside a sandboxed build environment (Vercel, CI) there is
    // no local `.env.production`; the connection strings come from the
    // platform's own environment variables instead. Only fail later if
    // DATABASE_URL / DIRECT_URL are genuinely missing from process.env.
    console.warn(`[db-migrate-pg] ${path} not found; relying on process env.`);
    return;
  }
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes (single or double) so URLs with
    // characters like `?` are preserved intact.
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(resolve(ROOT, ".env.production"));

const required = ["DATABASE_URL", "DIRECT_URL"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[db-migrate-pg] Missing required env var: ${k}`);
    process.exit(1);
  }
}

// DATABASE_URL is what `prisma migrate deploy` reads; DIRECT_URL is
// what the runtime uses for migrations and introspection on a
// pooler. Both are required when running against Neon + Accelerate.
process.env.DATABASE_URL = process.env.DATABASE_URL;
process.env.DIRECT_URL = process.env.DIRECT_URL;

const args = process.argv.slice(2);
const isStatus = args.includes("--status") || args.includes("--verify");

// Guard: only run real migrations on production deployments. Preview /
// development builds must never migrate the shared production database.
const vercelEnv = process.env.VERCEL_ENV;
if (vercelEnv && vercelEnv !== "production" && !isStatus) {
  console.log(
    `[db-migrate-pg] VERCEL_ENV=${vercelEnv}: skipping migrations (production-only).`
  );
  process.exit(0);
}

const prismaArgs = [
  "migrate",
  isStatus ? "status" : "deploy",
  "--schema",
  "prisma-pg/schema.prisma",
];

console.log(`[db-migrate-pg] Running: prisma ${prismaArgs.join(" ")}`);
console.log(
  `[db-migrate-pg] DATABASE_URL host: ${new URL(process.env.DATABASE_URL).host}`
);

const prismaCli = resolve(ROOT, "node_modules/prisma/build/index.js");

function runPrisma(args, capture) {
  return spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: process.env,
  });
}

const statusArgs = ["migrate", "status", "--schema", "prisma-pg/schema.prisma"];

if (!isStatus) {
  // P3009: a previous build left a "failed" row in _prisma_migrations,
  // and Prisma refuses to apply new migrations until it is resolved.
  // Detect and mark those migrations "rolled back" so `deploy` can
  // re-run them (all migrations here are idempotent, so this is safe).
  const status = runPrisma(statusArgs, true);
  const out = `${status.stdout ?? ""}\n${status.stderr ?? ""}`;
  const failedRe = /The\s+`([^`]+)`\s+migration\s+.*\bfailed\b/g;
  const failed = [];
  let m;
  while ((m = failedRe.exec(out)) !== null) {
    if (!failed.includes(m[1])) failed.push(m[1]);
  }
  for (const name of failed) {
    console.warn(`[db-migrate-pg] Resolving failed migration as rolled back: ${name}`);
    const resolveArgs = [
      "migrate",
      "resolve",
      "--rolled-back",
      name,
      "--schema",
      "prisma-pg/schema.prisma",
    ];
    const r = runPrisma(resolveArgs, false);
    if (r.error || r.status !== 0) process.exit(r.status ?? 1);
  }
}

const result = runPrisma(prismaArgs, false);

if (result.error) {
  console.error("[db-migrate-pg] Failed to spawn prisma:", result.error);
  process.exit(1);
}
process.exit(result.status ?? 0);
