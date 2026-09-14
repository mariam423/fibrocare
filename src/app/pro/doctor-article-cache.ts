/**
 * Cache configuration for the AI article library.
 *
 * This file is plain TypeScript (no `"use server"` directive) so it
 * can export both `const` values and helper functions. The
 * `"use server"` module `src/app/pro/doctor-article-actions.ts`
 * re-exports the constants it needs from here, because Next 16's
 * server-action contract only allows async-function exports.
 */

/**
 * Cache tag for the public verified-article list. The Doctor Hub
 * library reads through this tag, so any code that adds or removes
 * a verified post must call `revalidateTag(AI_ARTICLES_TAG)` to keep
 * the public feed consistent with the database.
 */
export const AI_ARTICLES_TAG = "ai-articles";

/** TTL for the public verified-article list cache (seconds). */
export const AI_ARTICLES_TTL_SECONDS = 60;

/**
 * Budget for the seed endpoint's rate limiter: 12 triggers per 5 minutes,
 * enforced per IP (API route) AND per user (server action — it is directly
 * callable). The seed de-dupes against a closed catalogue, so a populated
 * library makes repeats free; this budget only stops scripted hammering
 * while leaving headroom for fresh deploys and e2e runs to self-seed.
 *
 * Pinned by src/app/api/ai/articles/seed/route.test.ts — changing these
 * values must update that test deliberately, not silently.
 */
export const SEED_RATE_LIMIT = 12;
export const SEED_RATE_WINDOW_MS = 5 * 60 * 1000;

/**
 * How long a "seed started" marker stays hot (ms). Slightly above the
 * seed route's `maxDuration` (120s is the ceil — 90s covers the common
 * run) so concurrent first visitors skip the POST while the original
 * seeder is still working, but a crashed seed re-arms quickly.
 */
export const SEED_INFLIGHT_TTL_MS = 90_000;

/** What the library client should do after consulting the seed state. */
export type SeedDecision =
  /** Library has articles — render the list, never POST. */
  | "skip-listed"
  /** Library is empty but another visitor's seed just started — skip the
   *  POST and re-list shortly; their revalidateTag will surface rows. */
  | "skip-inflight"
  /** Library is empty and nobody is seeding — POST /api/ai/articles/seed. */
  | "seed";

/**
 * Pure decision for the library's mount flow. Extracted so the
 * client-side gate is unit-testable without React or server actions.
 */
export function decideSeedAction(state: {
  needsSeed: boolean;
  seedInFlight: boolean;
}): SeedDecision {
  if (!state.needsSeed) return "skip-listed";
  if (state.seedInFlight) return "skip-inflight";
  return "seed";
}
