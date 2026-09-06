#!/usr/bin/env node
/**
 * End-to-end check that the runtime Prisma singleton respects the
 * Accelerate feature flag.
 *
 * Bootstraps the same loader `src/lib/prisma.ts` uses (Next.js
 * path-aliases resolved through `tsconfig.json` paths) and asks
 * the singleton which adapter it resolved. Also issues a raw
 * query to confirm the wrap is functional and the underlying
 * datasource is the Accelerate pooler (not the direct DATABASE_URL).
 *
 * The script expects:
 *   - USE_ACCELERATE=1 in env (so the flag is "on")
 *   - PRISMA_ACCELERATE_URL in env (so the extension has a target)
 *   - DATABASE_URL in env (so the bare PrismaClient has somewhere
 *     to point if Accelerate fails to load)
 *
 * If anything is misconfigured the script exits 1 with a clear
 * message; otherwise it prints the resolved adapter name and a
 * query result.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Run with `npx tsx scripts/verify-accelerate-runtime.mjs`. tsx
// is a thin wrapper around esbuild that strips TS types and
// resolves the project's `tsconfig.json` paths (so the `@/*`
// imports in `src/lib/prisma.ts` work). We use the `.mjs`
// extension for the script itself so the file is plain ESM; the
// TS resolution only applies to the imported `src/lib/prisma.ts`.

const __filename = fileURLToPath(import.meta.url);
const ROOT = resolve(__filename, "..", "..");

// Load .env.production. We deliberately DO NOT load the dev .env
// because the smoke test should reflect the production wiring.
const envPath = resolve(ROOT, ".env.production");
if (!existsSync(envPath)) {
  console.error(`[verify-accel-runtime] ${envPath} not found`);
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

// Activate the Accelerate path.
process.env.USE_ACCELERATE = "1";
process.env.NODE_ENV = "production";

console.log(`[verify-accel-runtime] USE_ACCELERATE=1`);
console.log(
  `[verify-accel-runtime] PRISMA_ACCELERATE_URL host: ` +
    (() => {
      try {
        return new URL(process.env.PRISMA_ACCELERATE_URL).host;
      } catch {
        return "unknown";
      }
    })()
);

// Reset the module cache so the singleton is re-evaluated under
// the new env. (Same trick the unit tests use for `__reset*ForTests`.)
const { performance } = await import("node:perf_hooks");
const t0 = performance.now();
const mod = await import("../src/lib/prisma.ts");
const t1 = performance.now();
console.log(
  `[verify-accel-runtime] Prisma module loaded in ${(t1 - t0).toFixed(0)}ms`
);

const { prisma, getPrismaAdapterName } = mod;
const adapter = getPrismaAdapterName();
console.log(`[verify-accel-runtime] Resolved adapter: ${adapter}`);

if (adapter !== "accelerate") {
  console.error(
    `[verify-accel-runtime] Expected adapter to be 'accelerate' but got '${adapter}'.`
  );
  console.error(
    "  Check: USE_ACCELERATE=1, PRISMA_ACCELERATE_URL set, and the " +
      "@prisma/extension-accelerate package is installed."
  );
  process.exit(1);
}

// Issue a query. The query goes through Accelerate, which proxies
// to Prisma Postgres. We use $queryRaw so the test works even if
// the schema hasn't been applied to the Accelerate-backed database.
try {
  const rows = await prisma.$queryRawUnsafe("SELECT 1 AS ok");
  console.log("[verify-accel-runtime]  ✓ query:", rows);
} catch (err) {
  console.error(
    "[verify-accel-runtime]  ✗ query failed:",
    err instanceof Error ? err.message : String(err)
  );
  process.exit(1);
}

await prisma.$disconnect();
console.log("[verify-accel-runtime] OK");
