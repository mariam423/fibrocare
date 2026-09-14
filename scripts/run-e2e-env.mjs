#!/usr/bin/env node
/**
 * Write the gitignored `.env` used by CI e2e / build jobs.
 *
 * Why a script: `.env` is gitignored, so CI jobs must construct it.
 * Both `.github/workflows/e2e.yml` and `.github/workflows/build-verify.yml`
 * run this before anything that needs a database or sessions. Centralizing
 * it keeps the two workflows from drifting (build-verify historically
 * wrote a SQLite URL after the schema moved to Postgres, which broke
 * `migrate deploy` on every run once the migration lock flipped to
 * postgresql).
 *
 * Inputs (process env, provided by the workflow):
 *   CI_DATABASE_URL   Postgres connection string for the throwaway CI DB
 *                     (service container). Required.
 *   NEXTAUTH_URL      Base URL the dev server / audit signs in against.
 *                     Defaults to http://localhost:3000.
 *
 * Written keys:
 *   DATABASE_URL / DIRECT_URL   both pointed at the CI database
 *                               (no pooler in CI, so one URL suffices)
 *   NEXTAUTH_SECRET             random per job — sessions only need to
 *                               survive the job that mints them
 *   NEXTAUTH_URL                passthrough / default
 *   HEALTH_DATA_ENCRYPTION_KEY  random per job — satisfies the at-rest
 *                               encryption requirement in tests
 *   AI_MOCK_MODE                "true" — no provider keys in CI; the
 *                               deterministic seed articles cover the
 *                               AI-driven surfaces
 */
import { writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const databaseUrl = process.env.CI_DATABASE_URL;
if (!databaseUrl) {
  console.error(
    "[run-e2e-env] CI_DATABASE_URL is required (the workflow injects it from the Postgres service container)."
  );
  process.exit(1);
}

const nextAuthUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const nextAuthSecret = randomBytes(32).toString("base64");
const healthKey = randomBytes(32).toString("hex");

const lines = [
  `DATABASE_URL="${databaseUrl}"`,
  `DIRECT_URL="${databaseUrl}"`,
  `NEXTAUTH_SECRET="${nextAuthSecret}"`,
  `NEXTAUTH_URL="${nextAuthUrl}"`,
  `HEALTH_DATA_ENCRYPTION_KEY="${healthKey}"`,
  `AI_MOCK_MODE="true"`,
];

writeFileSync(".env", lines.join("\n") + "\n");
console.log(
  `[run-e2e-env] wrote .env (DATABASE_URL host: ${new URL(databaseUrl).host}, NEXTAUTH_URL: ${nextAuthUrl}, AI_MOCK_MODE: true)`
);
