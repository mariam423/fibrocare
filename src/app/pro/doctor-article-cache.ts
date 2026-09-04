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
