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
import { readShadowRemoteCounters } from "@/lib/observability/shadowRemote";
import { getBreakerState } from "@/lib/observability/circuitBreaker";
import { getActiveProvider } from "@/lib/ai/provider";
import {
  getFlagsSnapshot,
  isShadowCacheActive,
  isShadowRateLimitActive,
} from "@/lib/featureFlags";

export const maxDuration = 5;

function timingSafeEqual(a: string, b: string): boolean {
  // Pad to equal length to prevent timing oracle on length check
  const maxLen = Math.max(a.length, b.length);
  const aBuf = new TextEncoder().encode(a.padEnd(maxLen, "\0"));
  const bBuf = new TextEncoder().encode(b.padEnd(maxLen, "\0"));
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
  const metrics = snapshot();
  // The in-process counters are per-process — invisible across Vercel route
  // functions. Merge the Upstash-backed parity counters over them so the
  // operator sees the aggregate across every route and instance. When the
  // remote store is unreachable, `shadowRemote: "local-only"` says the
  // numbers below are this process' own counts, not the fleet's.
  const remoteShadow = await readShadowRemoteCounters();
  if (remoteShadow) {
    metrics.counters = {
      ...(metrics.counters as Record<string, number>),
      ...remoteShadow,
    };
  }

  return Response.json({
    adapters: {
      rateLimiter: getRateLimiterName(),
      cache: getCacheName(),
      database: getPrismaAdapterName(),
      // Shadow mode is *active* only when the flag, the credentials, AND
      // the not-yet-cutover condition all hold. `flags.shadowCache` below
      // is the operator's intent; `adapters.shadow` is what the process
      // actually did.
      shadow: {
        cache: isShadowCacheActive(),
        rateLimiter: isShadowRateLimitActive(),
      },
    },
    flags: getFlagsSnapshot(),
    breakers: {
      ...(provider ? { [`ai:${provider}`]: getBreakerState(`ai:${provider}`) } : {}),
    },
    metrics: {
      ...metrics,
      shadowRemote: remoteShadow ? "upstash" : "local-only",
    },
    uptimeSec: Math.round(process.uptime()),
  });
}
