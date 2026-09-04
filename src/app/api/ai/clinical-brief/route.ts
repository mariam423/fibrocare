import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";
import { getClinicalBrief } from "@/lib/ai/clinical-brief/report";
import { clinicalBriefSchema, type ClinicalBrief } from "@/lib/ai/clinical-brief/types";
import { TtlCache } from "@/lib/ai/cache";

export const maxDuration = 30;

/** Short cache: the brief summarizes 30-day data, minute-level freshness is plenty. */
const briefCache = new TtlCache<ClinicalBrief>(60_000);

/**
 * GET /api/ai/clinical-brief
 *
 * 1-page clinical executive brief for specialists. Fully deterministic
 * (offline-safe, no provider key needed); the LLM never computes the
 * numbers. Response is Zod-validated before leaving the route.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { ok, resetAt } = await checkFeatureRateLimit(session.user.id);
  if (!ok) {
    const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    return Response.json(
      { error: "Give the AI a moment — try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const brief = await briefCache.getOrSet(session.user.id, async () =>
      clinicalBriefSchema.parse(await getClinicalBrief(session.user.id as string))
    );
    return Response.json({ brief });
  } catch (err) {
    console.error("[ai] clinical-brief failed:", err);
    return Response.json({ error: "Could not build the clinical brief." }, { status: 500 });
  }
}
