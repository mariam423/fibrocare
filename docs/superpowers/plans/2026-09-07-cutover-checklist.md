# Phase L Cutover — Operator Checklist (2026-09-07)

> The 24h shadow window started **2026-09-06T15:59:50.189Z**. The gate opens
> **2026-09-07T15:59:50Z** (UTC). Do not cut over before then — or override
> deliberately with `--now`, accepting the risk.
>
> Production today is **Vercel**: <https://fibrocare-mariam-6620.vercel.app>
> (alias `fibrocare.vercel.app`), project `fibrocare`, scope `mariam-6620`.
> Runbook reference: [`DEPLOY.md`](../../../DEPLOY.md) §3.4. Phase L history:
> [`2026-09-06-phase-l-distributed-rollout.md`](./2026-09-06-phase-l-distributed-rollout.md).

## ⏰ Execution plan — 2026-09-07 (gate opens 15:59 UTC)

**Step 0 — anytime before the gate (2 min):**

```bash
node scripts/cutover.mjs --status   # confirm window shows "— complete ✓" after 15:59
```

**Step 1 — AT/AFTER 15:59 UTC: verify parity before flipping anything.**

- [ ] `vercel logs <latest-deployment-url> --scope mariam-6620` → grep for
      `parity mismatch` → expect **0 lines** since the current deploy
      (`fibrocare-82y7t13jw`, live since 2026-09-06 with shadow on)
- [ ] Upstash mirror warm (drive `/api/weather` first if unsure):
      scan `fibrocare:cache:*` → keys present
- [ ] `/api/health` → `shadow: {cache: true, rateLimiter: true}` still reported

**Gate to cutover: ALL of Step 1 green. If any mismatch warning exists in
logs — STOP, investigate, do not cut over.**

**Step 2 — cutover (Vercel first, then mirror locally):**

```bash
vercel env add USE_UPSTASH_CACHE production --force --scope mariam-6620      # value: 1
vercel env add USE_UPSTASH_RATELIMIT production --force --scope mariam-6620  # value: 1
vercel env add USE_ACCELERATE production --force --scope mariam-6620         # value: 1
vercel env rm SHADOW_CACHE production --scope mariam-6620
vercel env rm SHADOW_RATELIMIT production --scope mariam-6620
vercel env rm SHADOW_STARTED_AT production --scope mariam-6620
vercel deploy --prod -y --scope mariam-6620
node scripts/cutover.mjs --cutover   # mirror the same state into local .env.production
```

**Step 3 — post-cutover verification (see checklist below).**
If anything regresses → rollback section below, then re-enter shadow.

## ⚠ Where the flags actually live (read first)

`scripts/cutover.mjs` edits the **local `.env.production` only**. It does NOT
touch Vercel. Cutover on Vercel means setting the same three vars in the
project's *production* environment and redeploying:

```bash
# read current local decision, then mirror it on Vercel:
vercel env add USE_UPSTASH_CACHE production --force --scope mariam-6620      # 1
vercel env add USE_UPSTASH_RATELIMIT production --force --scope mariam-6620  # 1
vercel env add USE_ACCELERATE production --force --scope mariam-6620         # 1
vercel env rm SHADOW_CACHE production --scope mariam-6620
vercel env rm SHADOW_RATELIMIT production --scope mariam-6620
vercel env rm SHADOW_STARTED_AT production --scope mariam-6620
vercel deploy --prod -y --scope mariam-6620
```

Use `node scripts/cutover.mjs --status` for the gate clock only.

## Pre-flight (before touching anything)

- [ ] `node scripts/cutover.mjs --status` → window complete ✓ (gate ≥ 15:59 UTC)
- [ ] 24h shadow parity green: no `shadow cache parity mismatch` /
      `ratelimit parity mismatch` lines in `vercel logs <latest-deploy>`
      (note: `/api/health` counters are per-process on Vercel and may read 0 —
      logs + the Upstash mirror are the real signal)
- [ ] Upstash warm: mirrored keys exist under `fibrocare:cache:*`
      (weather keys confirmed 2026-09-06)
- [ ] Env present on Vercel production: `UPSTASH_REDIS_REST_URL`/`_TOKEN`,
      `PRISMA_ACCELERATE_URL`, `ADMIN_METRICS_TOKEN` (set 2026-09-06)

## Cutover

- [ ] Flip vars + clear shadow flags per the block above
- [ ] `vercel deploy --prod -y --scope mariam-6620` → Ready, aliased
- [ ] `curl -s https://fibrocare-mariam-6620.vercel.app/api/health -H "x-admin-token: $ADMIN_METRICS_TOKEN"` →
      `adapters: { rateLimiter: "upstash", cache: "upstash", database: "accelerate" }`,
      `shadow: { cache: false, rateLimiter: false }`
- [ ] Drive `/api/weather` → `source: "live"`, no new warnings in logs
- [ ] Spot-check latency (Upstash US-East from Vercel; expected ≈ tens of ms)

## Rollback (any time parity breaks or latency regresses)

```bash
vercel env rm USE_UPSTASH_CACHE production --scope mariam-6620
vercel env rm USE_UPSTASH_RATELIMIT production --scope mariam-6620
vercel env rm USE_ACCELERATE production --scope mariam-6620
# re-enable shadow monitoring (optional but recommended):
vercel env add SHADOW_CACHE production --scope mariam-6620        # 1
vercel env add SHADOW_RATELIMIT production --scope mariam-6620    # 1
vercel deploy --prod -y --scope mariam-6620
```

Then confirm `/api/health` is back to `memory`/`direct` + shadow true, and
file the parity/log evidence before retrying.

## Known follow-up (not blocking)

- Parity counters are in-process → invisible across Vercel route functions.
  If per-route parity visibility on serverless is wanted, move the counters
  to Upstash (`INCR` per check) — small change in
  `src/lib/observability/shadow.ts`.
- Local `.env.production` still holds shadow-only state; mirror the cutover
  there too (`node scripts/cutover.mjs --cutover`) so local scripts stay
  consistent with prod.
