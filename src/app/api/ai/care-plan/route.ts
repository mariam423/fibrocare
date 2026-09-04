import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { checkFeatureRateLimit } from "@/lib/ai/ratelimit";
import { buildCarePlan } from "@/lib/ai/care-plan/engine";
import { carePlanSchema } from "@/lib/ai/care-plan/types";

export const maxDuration = 30;

const bodySchema = z.object({
  totalSpoons: z.number().int().min(1).max(12),
  spentSpoons: z.number().int().min(0).max(12).default(0),
  painLevel: z.number().min(0).max(10),
  mood: z.string().max(40).nullish(),
});

/**
 * POST /api/ai/care-plan
 *
 * Adaptive daily care plan from today's check-in. Fully deterministic and
 * offline-safe — no provider key is needed, so this endpoint never reports
 * offline. The response is Zod-validated before it leaves the route.
 */
export async function POST(req: Request) {
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

  let input: z.infer<typeof bodySchema>;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const plan = buildCarePlan({
      date: new Date().toISOString().slice(0, 10),
      totalSpoons: input.totalSpoons,
      spentSpoons: input.spentSpoons,
      painLevel: input.painLevel,
      mood: input.mood ?? null,
    });
    carePlanSchema.parse(plan); // belt-and-braces boundary validation
    return Response.json({ plan });
  } catch (err) {
    console.error("[ai] care-plan failed:", err);
    return Response.json({ error: "Could not build a care plan." }, { status: 500 });
  }
}
