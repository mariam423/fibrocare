# FibroCare — Deployment Guide

This document covers **deploying the FibroCare major-system-upgrade** (Upstash Redis + Prisma Accelerate + observability + perf indexes). It assumes a managed Postgres + Azure Static Web Apps / Vercel / Docker workflow.

For the **public-facing project documentation**, see [`README.md`](./README.md). For a deep-dive on the architectural rationale, see [`docs/upgrade-2026-09.md`](./docs/upgrade-2026-09.md).

---

## 1. Pre-flight checklist

| # | Check | Command | Pass criteria |
|---|-------|---------|---------------|
| 1 | TypeScript clean | `npx tsc --noEmit` | 0 errors |
| 2 | Unit tests pass | `npm test` | All 606 vitest suites green |
| 3 | Lint clean (no new errors) | `npm run lint` | 0 new errors vs `main` |
| 4 | Production build succeeds | `npm run build` | Bundle builds, Prisma generates, SW builds |
| 5 | DB migration applies | `npx prisma migrate deploy` | All migrations applied, new `20260905000000_add_perf_indexes_and_accelerate` present |
| 6 | Smoke e2e | `npm run test:e2e` (chromium project) | At minimum, `e2e/smoke.spec.ts` green |

> **Disk-space note**: the dev build cache (`.next/`) can grow past 1.3 GB. Clean it with `rm -rf .next` between cold-start runs on a 20 GB filesystem.

---

## 2. Required env vars (production)

These are the **non-negotiable** values. Without them, the app refuses to serve or degrades to the in-process fallback.

```bash
# ── Database (required) ────────────────────────────────────────────
# Managed Postgres. The Prisma client uses `DATABASE_URL` for all
# queries; `DIRECT_URL` is only used by Prisma's CLI for migrations
# and introspection. They are the same connection string unless you
# have a separate migration user.
DATABASE_URL="postgresql://app:secret@db.example.com:5432/fibrocare?sslmode=require"
DIRECT_URL="postgresql://app:secret@db.example.com:5432/fibrocare?sslmode=require"

# ── NextAuth (required) ────────────────────────────────────────────
NEXTAUTH_SECRET="$(openssl rand -base64 32)"  # NEVER commit this
NEXTAUTH_URL="https://your-domain.example.com"

# ── Health-data encryption (required in production) ─────────────────
# AES-256-GCM key for free-text health notes. Generate with:
#   openssl rand -hex 32
# Without this, saving health notes fails loudly (never stored plaintext).
HEALTH_DATA_ENCRYPTION_KEY="<64 hex chars>"

# ── At least one AI provider (required for live AI features) ───────
# Google Gemini is recommended: free tier works in production, no card.
# Get a key at https://aistudio.google.com/apikey
GEMINI_API_KEY="<your-key>"
# AI_PROVIDER=google   # auto-detected if unset
# AI_MODEL=gemini-3.6-flash   # optional override
```

> **If you set neither `GEMINI_API_KEY` nor any other AI key**, the AI Care Companion runs in graceful offline mode (deterministic insight engines). Production will never fake AI responses with mocks — `AI_MOCK_MODE` is dev-only.

---

## 3. Recommended env vars (multi-instance deploys)

The upgrade ships with **opt-in distributed adapters**. With nothing set, every server instance has its own rate-limit and cache (fine for single-instance dev, unsafe for prod at scale). To turn them on:

### 3.1 Upstash Redis — distributed rate limit + cache

1. Create a database at [console.upstash.com](https://console.upstash.com) (free tier: 10K commands/day, no card).
2. Copy the **REST URL** and **REST Token** from the dashboard.
3. Set in your prod env:

```bash
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX...your-token"
```

**What changes when set:**

| Surface | Before (in-process) | After (Upstash) |
|---------|--------------------|----------------|
| `/api/chat` rate limit | 20/min **per server instance** | 20/min **across all instances** |
| `/api/ai/{insight,reflect,…}` rate limit | 10/min per instance | 10/min across all instances |
| LLM response cache | 200 entries per instance | Shared across all instances |
| `/api/ai/articles/generate` dedup | None | 1 req / 10s per (topic, language) globally |

**Failover behavior**: if Upstash is unreachable, the adapter logs a warning and **fails open** (allows the request). The route handlers' other rate limits (per-user provider budget) still apply.

### 3.2 Prisma Accelerate — connection pooling + edge query cache

1. Create a project at [console.prisma.io](https://console.prisma.io).
2. Connect your Postgres database.
3. Copy the **Accelerate connection string** (starts with `prisma://`).
4. Set:

```bash
PRISMA_ACCELERATE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

**What changes when set:**

- All Prisma queries route through Accelerate's pooler (no more "too many connections" under traffic spikes).
- Edge cache for read queries: identical `findUnique` calls within 60s return instantly.
- The Prisma client wraps itself with `@prisma/extension-accelerate` automatically — no code change.

### 3.3 Admin metrics endpoint

1. Generate a token: `openssl rand -hex 32`
2. Set: `ADMIN_METRICS_TOKEN="<token>"`
3. Verify after deploy: `curl -H "x-admin-token: <token>" https://your-domain/api/health`

Response shape:

```json
{
  "adapters": {
    "rateLimiter": "upstash",
    "cache": "upstash",
    "database": "accelerate"
  },
  "breakers": { "ai:google": "closed" },
  "metrics": {
    "counters": { "chat_429": 0, "ai_success": 142 },
    "lastSeen": { "chat_429": 1700000000000 },
    "dbLatencyP95Ms": 12
  },
  "uptimeSec": 3600
}
```

> Without `ADMIN_METRICS_TOKEN`, the route returns 503 (not 401) so a misconfigured deploy is loud, not silent.

---

## 4. Deployment matrix

| Platform | Guide |
|----------|-------|
| **Azure Static Web Apps** | The existing `.github/workflows/azure-swa.yml` runs `validate` (build + tests) then `build_and_deploy`. Add the new env vars to **GitHub Secrets** (`Settings → Secrets → Actions`). The SWA CLI builds with the same env you set in CI. |
| **Vercel** | `vercel.json` already pins `regions: ["iad1"]`. Set the new env vars in the Vercel dashboard. Run `npx vercel env pull` locally to sync. |
| **Docker / Azure App Service** | The `Dockerfile` produces a standalone Next.js bundle. Pass env vars at container start: `docker run -e UPSTASH_REDIS_REST_URL=... -e ... fibrocare:latest`. Health check is `/` (200 OK), `/api/health` requires the admin token. |

---

## 5. Post-deploy verification

```bash
# 1. App is up and the home page loads
curl -fsS https://your-domain/ | head -5

# 2. Article list endpoint is cached at the edge
curl -fsS -I https://your-domain/api/ai/articles/list
# Expect: Cache-Control: s-maxage=300, stale-while-revalidate=600

# 3. Health endpoint reports the right adapters
curl -fsS -H "x-admin-token: $ADMIN_METRICS_TOKEN" https://your-domain/api/health | jq

# 4. Rate limit returns 429 with Retry-After when burst-triggered
for i in $(seq 1 25); do curl -s -o /dev/null -w "%{http_code} " \
  -H "cookie: next-auth.session-token=<test-token>" \
  https://your-domain/api/chat; done
# Expect: 200 200 ... 429 (after the 20th call within 60s)
```

---

## 6. Rollback strategy

Each upgrade layer is gated by env-var presence. To roll back **any single layer** without redeploying:

| To roll back… | Action |
|---------------|--------|
| Upstash rate limit | `unset UPSTASH_REDIS_REST_URL` (or remove from env) → in-process fallback takes over |
| Upstash cache | Same as above |
| Prisma Accelerate | `unset PRISMA_ACCELERATE_URL` → direct Prisma connection |
| All distributed adapters | Remove all three env vars → bit-identical to pre-upgrade |
| Perf indexes | `npx prisma migrate resolve --rolled-back 20260905000000_add_perf_indexes_and_accelerate` |
| Whole upgrade | `git revert <commit-hash>` → restore the schema, drop the new files, redeploy |

**The pre-upgrade code path is fully preserved in-process.** With no `UPSTASH_*` and no `PRISMA_ACCELERATE_URL`, the existing in-memory `Map` rate limiter and `TtlCache` are used, and the Prisma client talks to `DATABASE_URL` directly.

---

## 7. Operations runbook

### "I see `adapters.rateLimiter: "memory"` in `/api/health`"

Upstash env vars are not reaching the server. Check:
1. The container / function has `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set.
2. The values are not quoted as a single string (each var is its own value).
3. The server was restarted after the env change (Next.js reads env at boot, not per request).

### "I see `breakers.ai:google: "open"` in `/api/health`"

The AI provider breaker tripped (5 consecutive failures in 30s). The next request after 60s will half-open. Investigate the provider status page:
- [Google AI Status](https://status.cloud.google.com) (Gemini)
- [OpenAI Status](https://status.openai.com)
- [Anthropic Status](https://status.anthropic.com)

### "I see `dbLatencyP95Ms: 200+`"

Postgres is the bottleneck. Either:
- The connection pool is saturated — verify Accelerate is on (`/api/health` reports `database: "accelerate"`).
- A specific query is doing a full table scan — check the Prisma query log (`DEBUG=prisma:query` env var).
- A new index is missing — re-run `npx prisma migrate status` to confirm all migrations are applied.

---

## 8. What's in the upgrade

- **17 new unit tests** covering the distributed adapters, circuit breaker, and metrics.
- **1 new migration** (`20260905000000_add_perf_indexes_and_accelerate`) — 5 `CREATE INDEX` statements, all additive.
- **9 new env vars** (4 optional Upstash, 1 optional Accelerate, 1 optional admin token, 3 existing now better documented).
- **0 removed features** — every pre-upgrade route returns byte-identical responses when no distributed env vars are set.

See [`docs/upgrade-2026-09.md`](./docs/upgrade-2026-09.md) for the full architectural rationale.
