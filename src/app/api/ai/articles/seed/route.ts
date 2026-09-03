/**
 * GET /api/ai/articles/seed
 *
 * Triggers a one-shot seed of the curated article library. Idempotent:
 * topics that already have a published post are returned as-is, only the
 * missing ones are generated. Doctor Hub calls this on first visit so the
 * feed never shows the empty state.
 */

import { seedDoctorArticleLibrary } from "@/app/pro/doctor-article-actions";

export const maxDuration = 120;

export async function GET() {
  try {
    const result = await seedDoctorArticleLibrary();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    console.error("[ai-articles] seed failed:", error);
    return Response.json(
      { ok: false, error: "Failed to seed the article library." },
      { status: 500 }
    );
  }
}
