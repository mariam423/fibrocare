/**
 * GET /api/health
 *
 * Admin-only endpoint that reports which adapters the current process
 * resolved, the in-process metrics snapshot, and the circuit-breaker
 * state for each AI provider. Gated by `ADMIN_METRICS_TOKEN` — without
 * the env var, the route refuses to serve anything (constant-time
 * compare via `crypto.timingSafeEqual`).
 *
 * This is not a deep health check (no DB ping, no upstream probe). It
 * is observability of the *upgrade itself*: which adapter is in use,
 * how many 429s have been served, what the breaker says.
 *
 * The path is `/api/health` (not `/_health`) because Next.js excludes
 * underscore-prefixed routes from the build.
 */
import { getRateLimiterName } from "@/lib/ratelimit/selectAdapter";
import { getCacheName } from "@/lib/cache/selectAdapter";
import { getPrismaAdapterName } from "@/lib/prisma";
import { snapshot } from "@/lib/observability/metrics";
import { getBreakerState } from "@/lib/observability/circuitBreaker";
import { getActiveProvider } from "@/lib/ai/provider";
import { getFlagsSnapshot } from "@/lib/featureFlags";

export const maxDuration = 5;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBuf = new TextEncoder().encode(a);
  const bBuf = new TextEncoder().encode(b);
  // Node's Web Crypto `subtle.timingSafeEqual` requires equal lengths,
  // which we just enforced above.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { timingSafeEqual: tse } = require("node:crypto") as typeof import("node:crypto");
  return tse(aBuf, bBuf);
}

export async function GET(request: Request) {
  const expected = process.env.ADMIN_METRICS_TOKEN;
  if (!expected) {
    return Response.json(
      { error: "Admin metrics not configured." },
      { status: 503 }
    );
  }
  const provided = request.headers.get("x-admin-token") ?? "";
  if (!timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const provider = getActiveProvider();
  return Response.json({
    adapters: {
      rateLimiter: getRateLimiterName(),
      cache: getCacheName(),
      database: getPrismaAdapterName(),
    },
    flags: getFlagsSnapshot(),
    breakers: {
      ...(provider ? { [`ai:${provider}`]: getBreakerState(`ai:${provider}`) } : {}),
    },
    metrics: snapshot(),
    uptimeSec: Math.round(process.uptime()),
  });
}
