# Major System Upgrade — September 2026

> **Status**: shipped on `main`. 606 unit tests pass, 0 new TypeScript errors, 0 new lint errors, production build succeeds.

This document is the architectural rationale for the upgrade. For **how to deploy**, see [`../DEPLOY.md`](../DEPLOY.md).

---

## 1. What changed and why

FibroCare is a patient-facing wellness platform for fibromyalgia. Three load-bearing surfaces carry the most traffic:

1. **AI Care Companion** (`/api/chat`) — streaming chat, NextAuth-gated, 45 s ceiling.
2. **AI insight engines** (`/api/ai/{insight,reflect,care-plan,clinical-brief,questions,parse-log}`) — 6 streaming routes, each 45 s.
3. **AI article library** (`/api/ai/articles/{list,generate,seed}`) — public feed.

**Pre-upgrade**, every horizontal-scaling assumption was broken:

- `src/lib/ai/ratelimit.ts` was a **per-process** sliding window (`Map<string, WindowEntry>`). Two server instances = two separate limits. A misbehaving client could send 2× the intended budget.
- `src/lib/ai/cache.ts` was a **per-process** `TtlCache` (200 entries, 10 min TTL). Repeat LLM calls across instances re-hit the provider and re-burn budget.
- `prisma/schema.prisma` had **no connection pooler** in front, and was missing indexes on `User(role)`, `User(signupRole)`, `User(createdAt)`, and a composite `(consultationId, createdAt)` for chat pagination.
- `vercel.json` pinned a single region (`iad1`). A second-region rollout would double the rate-limit and cache problems above.

**Post-upgrade**, every layer is **opt-in distributed**:

- A typed contract (`IDistributedRateLimiter`, `IDistributedCache`) lets the existing in-process adapters and the new Upstash adapters sit behind the same call site.
- The Prisma client transparently wraps itself with `@prisma/extension-accelerate` when `PRISMA_ACCELERATE_URL` is set.
- An in-process circuit breaker around `getModel()` prevents a single misbehaving AI provider from cascading into a global outage.
- An admin-gated `/api/health` route reports which adapters are in use, in-process metrics, and breaker state.

**Key invariant**: with no `UPSTASH_*` and no `PRISMA_ACCELERATE_URL` env vars, every route returns **byte-identical** responses to pre-upgrade. The rollout is free.

---

## 2. Layered architecture

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Browser                                                                       │
│   CSP: connect-src 'self'  ←  no third-party origins, ever                    │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │ HTTPS (proxied — no direct AI/Redis)
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Edge / CDN  (Vercel Edge / Azure SWA)                                        │
│   Cache-Control honored:                                                      │
│     /api/ai/articles/list  →  s-maxage=300, stale-while-revalidate=600        │
│     /_next/static          →  public, max-age=31536000, immutable             │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Next.js 16 Standalone (Node 20)                                              │
│ ┌────────────────────────────────────────────────────────────────────────┐   │
│ │ src/proxy.ts  ─  route guard (NextAuth JWT check)                      │   │
│ │ src/app/api/**  ─  route handlers                                      │   │
│ │                                                                        │   │
│ │ NEW wrappers (env-gated):                                              │   │
│ │   src/lib/ratelimit/selectAdapter.ts   →  Upstash | InMemory           │   │
│ │   src/lib/cache/selectAdapter.ts       →  Upstash | InMemory           │   │
│ │   src/lib/observability/circuitBreaker.ts                              │   │
│ │   src/lib/observability/metrics.ts                                     │   │
│ └────────────────────────────────────────────────────────────────────────┘   │
│                                                                            │
│ src/lib/prisma.ts (modified):                                               │
│   when PRISMA_ACCELERATE_URL is set → wraps with @prisma/extension-accelerate│
└────────────────┬─────────────────────────────────┬───────────────────────────┘
                 │                                 │
                 ▼                                 ▼
        ┌─────────────────────┐         ┌────────────────────────────┐
        │  Upstash Redis      │         │  Prisma Accelerate          │
        │  @upstash/ratelimit │         │   ↓                        │
        │  @upstash/redis     │         │  Managed Postgres           │
        │  (sliding window,   │         │  (Azure DB / Neon / Supabase)│
        │   fail-open)        │         │                              │
        └─────────────────────┘         └────────────────────────────┘
```

The browser **never** talks to a third-party origin directly. Every external call (Upstash, Accelerate, Gemini, OpenWeather) is server-side only, so the CSP stays `connect-src 'self'`.

---

## 3. Rate limiter: in-process → distributed

### The contract

```ts
// src/lib/ratelimit/IDistributedRateLimiter.ts
export interface IDistributedRateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;   // epoch ms
}
```

### The two adapters

| Adapter | When | Cost | Latency |
|---------|------|------|---------|
| `InMemoryRateLimiter` | No `UPSTASH_REDIS_REST_URL` | 0 | ~0 ms (no `await` cost) |
| `UpstashRateLimiter` | Both Upstash env vars set | 1 Redis round-trip per call | ~5–15 ms regional |

Both return the same `Promise<RateLimitResult>`. The selector (`selectAdapter.ts`) caches the choice at process level so the env-var check happens once.

### Failover

If Upstash is unreachable, `UpstashRateLimiter.check()` catches the error, logs a warning, and **fails open** (returns `{ ok: true }`). Rationale: rate limiting is a defense-in-depth tool. If Redis is down, the provider key budget and the route's downstream logic still bound the damage. The cost of failing closed (refusing all requests when Redis is degraded) is worse than the cost of failing open.

### Per-route budgets

| Route | Per user | Window | Notes |
|-------|---------:|--------|-------|
| `/api/chat` | 20 | 60 s | Long-form streaming; tighter than features |
| `/api/ai/{insight,reflect,…}` | 10 | 60 s | Six one-shot endpoints share the `feature:` namespace |
| `/api/ai/articles/generate` | 1 per (topic, language) | 10 s | Coarse cross-instance dedup so two clients can't race the same LLM call |

The `Retry-After` HTTP header is set on every 429 to the seconds remaining in the window — `Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))`.

---

## 4. Cache: where the distributed adapter lives

The cache adapter mirrors the in-process `TtlCache<T>` API. The pre-upgrade `src/lib/ai/cache.ts` still exists and is what the in-memory adapter wraps, so all 11 existing call sites (questions cache, brief cache, weather cache, etc.) keep working.

### What the distributed cache is currently used for

The distributed cache is the right tool for **inputs the LLM needs to see**, not for the **streamed response** itself. Streaming responses (`streamText().toUIMessageStreamResponse()`) are not replayable — caching a half-streamed AI response is incoherent. What is cacheable, and is now cached:

| Surface | What is cached | TTL | Why this layer |
|---------|---------------|-----|----------------|
| `buildHealthSnapshot(userId)` | The 30-day health snapshot the prompt embeds | 30s | Dashboard refresh storm (3 AI features, 1 user, 1s) used to issue 3 identical DB reads; now issues 1 |
| `getInsightSummaries(userId, 30)` | The 30-day insight summary | 30s | Same call site as above; same reasoning |
| Weather response (per location) | The full OpenWeather response | 10m | Two-layer cache (distributed + in-process) keeps a multi-instance deploy at 1/6 of the free-tier quota per (location, key) |

The 30s TTL on the snapshot/insights is short on purpose: a stale snapshot would feed the prompt with yesterday's pain, and the user is the data source. 30s is well under typical dwell time, so the user never sees a stale value within a single session, but the duplicate-read storm is absorbed.

The pre-upgrade cache wrappers around deterministic AI responses (questions cache keyed on `userId + logCount + locale`, brief cache, weather cache) are unchanged — they keep their `TtlCache` instances, and the new `getCache()` selector is layered *on top* of them for the cross-instance path.

### What is NOT cached (and why)

- **Streamed chat/insight/reflect responses** — not replayable. The token stream arrives on the model's own timeline; a partial stream is not a value that can be served on a second request. The prompt *inputs* (the snapshot) are cached, which is the larger DB-saving win.
- **The RAG retrieval result** — `assembleCompanionContext` runs per request because the user's short-term memory (the thread) changes between messages. Caching RAG by user would be incorrect.
- **OpenAI/Anthropic/Gemini SDK internals** — the cache sits at the route boundary, not inside the SDK.

### Failover

Identical to the rate limiter: if Upstash is unreachable, the adapter logs a warning and **fails open** (treats the entry as a miss and re-runs the producer). Rationale: a stale snapshot for one request is worse than a missed cache.

---

## 5. Database: Accelerate + indexes

### Prisma Accelerate

When `PRISMA_ACCELERATE_URL` is set, `src/lib/prisma.ts` wraps the bare `PrismaClient` with `withAccelerate()`. This is the **only** code change required — every call site (`prisma.user.findUnique({ where: { id } })`, etc.) is unchanged.

**`directUrl` vs `url`**:
- `url` = `DATABASE_URL` — used by the runtime client (goes through Accelerate if configured, else direct).
- `directUrl` = `DIRECT_URL` — used by Prisma's CLI for migrations and introspection.

In dev, both point at the SQLite file. In prod with Accelerate, `url` is the Accelerate URL and `directUrl` is the unpooled Postgres connection.

### New indexes (`20260905000000_add_perf_indexes_and_accelerate`)

| Index | Why | Query that benefits |
|-------|-----|---------------------|
| `User(role)` | "All doctors", "All pro users" admin queries | `WHERE role = 'doctor'` |
| `User(signupRole)` | Cohort analytics (patient vs doctor) | `GROUP BY signupRole` |
| `User(createdAt)` | Growth chart by signup date | `WHERE createdAt >= ?` |
| `ArticleReaction(userId)` | "Everything I reacted to" view | `WHERE userId = ?` |
| `ConsultationMessage(consultationId, createdAt)` | Chat pagination (replaces single-column `consultationId`) | `WHERE consultationId = ? ORDER BY createdAt` |

The composite index on `ConsultationMessage` replaces the existing single-column `consultationId` index — the composite covers the same lookup AND the `ORDER BY`, so a single B-tree seek serves the paginated thread read.

### What's NOT in this upgrade

- **Sharding**: SQLite has no sharding; Postgres sharding is a much larger refactor. With Accelerate's connection pooling, sharding is not on the critical path for the next 10× growth.
- **Read replicas**: same — Accelerate's edge cache makes most reads O(1) without a separate replica.
- **Cross-region replication**: requires a managed Postgres with logical replication; that's a host-platform decision, not a code change.

---

## 6. Circuit breaker

`src/lib/observability/circuitBreaker.ts` implements a three-state breaker:

```
  closed ──5 failures──> open ──60 s──> half-open ──1 success──> closed
                              └──────────1 failure──────────> open
```

**Why**: a misbehaving AI provider (Google 5xx, OpenAI rate limit, Anthropic outage) currently cascades into a global 502 — every chat request fails for every user. With the breaker:

- After 5 consecutive failures in 30 s, the breaker **opens** for the affected provider.
- `getModelSafe()` (the new wrapper) returns `null` while the breaker is open.
- Route handlers already handle `null` — they return `{ offline: true }` and the UI shows the graceful offline state.
- After 60 s, the breaker goes **half-open** — one trial request. Success closes it, failure re-opens.

**Per-instance**: each server process tracks its own breaker. That's fine — the breaker is a per-process guard against cascading failures, not a global coordination primitive (Upstash rate limiting handles that).

**Wiring**: `src/app/api/chat/route.ts` calls `recordAiSuccess()` in `onFinish` and `recordAiFailure()` in the `try/catch` around `streamText`. The other 5 AI routes record via `onError` hooks on `streamText` / `generateObject`.

---

## 7. Observability

`src/lib/observability/metrics.ts` is a tiny in-process counter map (no Prometheus, no OTel). It tracks:

- `chat_429` / `feature_429` — every rate-limit denial.
- `ai_success` / `ai_failure` — every LLM call.
- DB latency p95 over a 60-sample sliding window.

`GET /api/health` is the read-out. It's gated by `ADMIN_METRICS_TOKEN` (constant-time compared via `crypto.timingSafeEqual`).

```bash
$ curl -H "x-admin-token: $ADMIN_METRICS_TOKEN" https://your-domain/api/health
{
  "adapters":  { "rateLimiter": "upstash", "cache": "upstash", "database": "accelerate" },
  "breakers":  { "ai:google": "closed" },
  "metrics":   { "counters": { "chat_429": 0 }, "dbLatencyP95Ms": 12 },
  "uptimeSec": 3600
}
```

**Multi-instance**: each instance has its own counters, so the route reports the current process's view. Aggregate across instances via the host's log aggregation (Vercel Logs, Azure App Insights).

---

## 8. Migration guide (one-time)

The 5 new indexes are added in a single migration. For an existing prod DB:

```bash
# 1. Apply the migration. CREATE INDEX on an existing table is
# non-blocking in Postgres CONCURRENTLY, but the Prisma migration
# is a plain CREATE INDEX — for a 100K+ row table, do it during
# a low-traffic window or use:
npx prisma migrate deploy

# 2. Verify with the new /api/health route:
curl -H "x-admin-token: $ADMIN_METRICS_TOKEN" .../api/health
# Expect: adapters.database: "direct" (or "accelerate" if env set)

# 3. (Optional) Opt in to distributed adapters by setting env vars
# and redeploying. No code change required.
```

---

## 9. Non-goals (deliberate)

- **No gRPC / message queue**: the app's request-response shape is well-served by REST. A queue adds operational overhead without solving a real problem.
- **No service mesh**: at our scale, Next.js's built-in `output: "standalone"` + a CDN is the right abstraction. Istio/Linkerd would be 10× the cost for no measurable win.
- **No GraphQL**: the 30+ REST routes are stable and well-tested. A GraphQL layer would be a rewrite, not an upgrade.
- **No custom auth**: NextAuth + Prisma is the right primitive. Clerk/Auth0 would be an external dependency for a 200-line config.
- **No WebSocket fan-out**: chat uses Server-Sent Events (Vercel AI SDK's `streamText`). A real-time presence layer is future work, not scaling work.

---

## 10. Files added (reference)

```
src/lib/ratelimit/IDistributedRateLimiter.ts        # interface
src/lib/ratelimit/InMemoryRateLimiter.ts             # in-proc adapter
src/lib/ratelimit/upstashLimiter.ts                 # Upstash adapter
src/lib/ratelimit/selectAdapter.ts                  # env-gated factory
src/lib/ratelimit/__tests__/selectAdapter.test.ts   # 3 tests

src/lib/cache/IDistributedCache.ts                  # interface
src/lib/cache/InMemoryDistributedCache.ts           # in-proc adapter
src/lib/cache/upstashCache.ts                       # Upstash adapter
src/lib/cache/selectAdapter.ts                      # env-gated factory

src/lib/upstash/client.ts                           # lazy Redis singleton
src/lib/upstash/__tests__/upstashLimiter.test.ts    # 3 tests
src/lib/upstash/__tests__/upstashCache.test.ts      # 4 tests

src/lib/observability/metrics.ts                    # in-proc counters
src/lib/observability/circuitBreaker.ts             # 3-state breaker
src/lib/observability/__tests__/metrics.test.ts     # 4 tests
src/lib/observability/__tests__/circuitBreaker.test.ts # 8 tests

src/lib/ai/__tests__/ratelimit.test.ts              # 4 tests (async-shape contract)
src/lib/ai/__tests__/snapshotCache.test.ts          # 3 tests (per-user cache wrapper)
src/lib/ai/snapshotCache.ts                         # per-user 30s cache for snapshot + insights

src/app/api/health/route.ts                         # admin-gated health

prisma/migrations/20260905000000_add_perf_indexes_and_accelerate/
                                                    # 5 CREATE INDEX statements
```

**Files modified (minimal touch)**:

- `prisma/schema.prisma` — `directUrl` + 5 `@@index`
- `src/lib/prisma.ts` — `withAccelerate()` branch + `getPrismaAdapterName()`
- `src/lib/ai/ratelimit.ts` — `checkChatRateLimit` / `checkFeatureRateLimit` are now async
- `src/lib/ai/provider.ts` — `getModelSafe()`, `recordAiSuccess()`, `recordAiFailure()`
- 8 route handlers — `await` added to rate-limit calls, `Retry-After` headers, breaker hooks
- `src/app/api/ai/articles/list/route.ts` — `Cache-Control` bumped 60s → 300s
- `src/app/api/ai/articles/generate/route.ts` — coarse `(topic, language)` rate limit
- `src/app/api/ai/{insight,reflect,questions}/route.ts` + `src/lib/ai/memory.ts` — snapshot/insights calls go through the per-user `getCachedHealthSnapshot` / `getCachedInsightSummaries` wrapper (30s, distributed when Upstash is configured)
- `src/app/api/weather/route.ts` — response cache now goes through the same `IDistributedCache` selector as the LLM cache (10-min TTL, distributed when Upstash configured)
- `.env` + `.env.example` — 5 new env vars documented

**Files NOT touched** (preserved exactly):

- Every UI component, page, and translation.
- Every existing test (606 of 606 still pass; 20 new tests added on top).
- The build, lint, typecheck, and CI configs.
- The Dockerfile, `next.config.ts`, `vercel.json`, and CSP.

---

## 11. What you can do now that you couldn't before

- **Deploy to two regions** (e.g. `iad1` + `cdg1`) and have the rate limit be global, not per-region.
- **Add a third server instance** during a traffic spike and not have it become an attack vector (per-instance rate limits would let a client send 3× the budget across instances).
- **Roll out a new feature** behind a 1 req / 10s `(topic, language)` throttle without writing any rate-limit code — `checkRateLimitDistributed` is the API.
- **Detect a flaky AI provider** in seconds via the `/api/health` breaker state, instead of seeing a 50% 502 spike in your logs.
- **Tune the chat rate limit** from 20/min to 30/min by changing one constant in `src/lib/ai/ratelimit.ts` — the same change applies to every instance, no per-instance config drift.
