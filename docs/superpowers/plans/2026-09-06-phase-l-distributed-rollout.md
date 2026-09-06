# Phase L — Distributed Infrastructure Rollout (completed)

> Status: **COMPLETE** (L-1 through L-6). Shipped on `main`; live shadow-mode
> parity verified against real Upstash on 2026-09-06. Runbook:
> [`DEPLOY.md`](../../../DEPLOY.md) §3.4. Rationale:
> [`docs/upgrade-2026-09.md`](../../upgrade-2026-09.md).

**Goal:** Make rate limiting, caching, and database pooling distributed and
opt-in, so multi-instance deploys share one budget without changing behaviour
when the env vars are absent.

**Rollout rule:** every adapter is off until BOTH its `USE_*` flag AND its
credentials are set. Either alone is a no-op. Validation runs in shadow mode
for 24h before cutover (see L-6).

---

### L-1: Postgres (Neon) migration
**Files:** `prisma/schema.prisma`, `prisma-pg/schema.prisma`, `scripts/db-migrate-pg.mjs`, `.env.example`

- [x] Switch `prisma/schema.prisma` to `provider = "postgresql"` with `directUrl`.
- [x] Add `prisma-pg/schema.prisma` (Postgres datamodel for `migrate diff`).
- [x] Add `npm run db:migrate:pg` / `db:status:pg` scripts.
- [x] Verify: `commit 3c9b5cb`, connection check green.

### L-2: Prisma Accelerate wiring with feature flag
**Files:** `src/lib/prisma.ts`, `src/lib/featureFlags.ts`

- [x] Lazy PrismaClient singleton; wrap with `base.$extends(withAccelerate())` when `USE_ACCELERATE=1` + `PRISMA_ACCELERATE_URL`.
- [x] Load `@prisma/extension-accelerate` via `createRequire` (hidden from Turbopack static analysis); anchor at `process.cwd()` (the `__filename` anchor broke under Next dev's virtual paths).
- [x] `getPrismaAdapterName()` reports the *resolved* adapter (flag on + failed load → `direct`, never a false `accelerate`).
- [x] Verify: `npx tsx scripts/verify-accelerate-runtime.mjs` → `Resolved adapter: accelerate`, query OK; `scripts/verify-accelerate-connection.mjs` → cold/warm OK.

### L-3: Upstash Redis + Ratelimit (US East) with feature flag
**Files:** `src/lib/upstash/client.ts`, `src/lib/ratelimit/*`, `src/lib/cache/upstashCache.ts`

- [x] Lazy Redis + Ratelimit singletons; SDKs loaded via `createRequire` from a real path; namespace-shaped modules unwrapped (`{ Redis }`, `{ Ratelimit }`).
- [x] `IDistributedRateLimiter` / `IDistributedCache` contracts; `selectAdapter` factories gate on flag + credentials.
- [x] Fail-open on Upstash errors (rate limiting is defense-in-depth).
- [x] Verify: `src/lib/upstash/__tests__/clientLoader.test.ts` (real namespace shape), adapter-selection tests, live smoke test.

### L-4: Cache TTL strategy + invalidation hooks
**Files:** `src/lib/ai/snapshotCache.ts`, `src/app/api/weather/route.ts`

- [x] 30s per-user snapshot/insights cache (collapses dashboard refresh-storm duplicate reads; stale-never-within-session).
- [x] 10min weather response cache via the distributed adapter (1/6 of OpenWeather free-tier quota per (location, key)).
- [x] TTL set at write time via Upstash `EX`; streamed AI responses deliberately NOT cached (not replayable).
- [x] Verify: `snapshotCache` tests, weather route tests.

### L-5: Observability — metrics + error tracking
**Files:** `src/lib/observability/*`, `src/app/api/health/route.ts`

- [x] In-process counters + lastSeen + 60-sample DB latency p95 (`metrics.ts`).
- [x] 3-state circuit breaker per AI provider (`circuitBreaker.ts`, `getModelSafe()` wiring).
- [x] `/api/health` (admin-token gated, constant-time compare): adapters (incl. `shadow` state), flags, breakers, metrics, uptime.
- [x] Verify: `metrics` + `circuitBreaker` tests.

### L-6: Shadow mode (24h) + cutover script
**Files:** `src/lib/cache/shadowCache.ts`, `src/lib/ratelimit/shadowLimiter.ts`, `src/lib/observability/shadow.ts`, `scripts/cutover.mjs`

- [x] `ShadowCache` / `ShadowRateLimiter`: primary (in-process) serves; Upstash runs in parallel for parity. Mismatch = post-cutover behaviour change (cache: primary hit / shadow miss; ratelimit: primary allow / shadow deny).
- [x] Parity counters `shadow_{cache,ratelimit}_{check,mismatch}` in `/api/health`.
- [x] `scripts/cutover.mjs` (`--enable-shadow` / `--status` / `--cutover` with 24h gate from `SHADOW_STARTED_AT` / `--rollback`), npm scripts `shadow:enable`, `cutover:status`, `cutover:apply`, `cutover:rollback`.
- [x] Runbook documented in `DEPLOY.md` §3.4; addendum in `docs/upgrade-2026-09.md` §12.
- [x] Verify: unit tests (shadow parity + selector branches + flag rules) and a **live smoke test against real Upstash (2026-09-06)**: 21 cache checks / 0 mismatches, 7 rate-limit checks / 0 mismatches — after fixing two real loader bugs the run exposed (Turbopack virtual-path anchor, namespace-shaped SDK modules).

---

### Final verification (2026-09-06)

- [x] `npx tsc --noEmit` — 0 errors
- [x] `npm test` — 637 tests / 62 files green
- [x] `npm run build` — production build + SW generation OK
- [x] `npx eslint` on touched files — 0 new errors
- [x] Live shadow parity vs real Upstash — 0 mismatches

### Commits

- `9fc9bf7` feat(backend): non-destructive major system upgrade (L-3..L-5 core)
- `91554ee` feat(infra): add feature flags scaffold for Phase L rollout
- `3c9b5cb` feat(db): migrate from SQLite to Postgres (Neon) for Phase L-1
- `8dfe3a5` feat: add landing video previews, demo scripts, and prisma accelerate setup (L-2 wiring)
- `c0a94a8` feat(infra): ship L-6 shadow mode + cutover, fix Accelerate runtime loading
- *(pending)* shadow smoke-test loader fixes (cwd anchor + namespace unwrap + regression test)

### Next step (operator)

Run `npm run shadow:enable` on the production environment, redeploy, and
watch `/api/health` for 24h before `npm run cutover:apply`. The code side of
L-1…L-6 is complete; the production window is the remaining operational step.
