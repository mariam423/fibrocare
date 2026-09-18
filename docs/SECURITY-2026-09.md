# Security Audit — September 2026

Full-scope review of FibroCare's web, AI, and PWA layers, run 2026-09-18.
Methodology: manual source-first audit (OWASP Top 10 for web apps, OWASP
Top 10 for LLM apps, MITRE ATLAS for the AI layer, PWA cache/origin
review), every finding confirmed by reading the exploitable path in code
and validated against the existing test suite before remediation.

**Result: 4 findings found → 4 fixed → 993/993 tests green, build clean.**

---

## Severity summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | Medium | CSRF gate missing on `/api/pro/posts/[id]/like` and `…/comments` | ✅ Fixed |
| 2 | Medium | Caregiver share page indexable by search engines | ✅ Fixed |
| 3 | Low→Medium | No guess-resistance on the unauthenticated caregiver token endpoint | ✅ Fixed |
| 4 | Low | Test file carried secret-shaped fixture strings that trip scanners | ✅ Fixed |

No critical or high findings. The sections below give each finding's
attack scenario, fix, and verification.

---

## Findings & remediation log

### 1. Inconsistent CSRF enforcement on the pro-posts sub-routes (Medium)

**Where:** `src/app/api/pro/posts/[id]/like/route.ts`,
`src/app/api/pro/posts/[id]/comments/route.ts`

**Scenario:** `POST /api/pro/posts` enforced a same-origin `Origin` check,
but the like and comment sub-routes did not. The `SameSite=Lax` session
cookie already blocks cross-site POSTs in every modern browser, so this
was defense-in-depth depth rather than an open hole — but the codebase's
own contract (documented in the posts route header) was "mutating routes
pass the Origin gate", and two mutating routes silently skipped it. A
browser without SameSite enforcement, or a future cookie change, would
have made the gap exploitable: an attacker page could trigger
like/comment actions as a signed-in victim.

**Fix:** The same `sameOrigin()` gate from `../route.ts` (normalized
scheme+host comparison against the request host, no-Origin = allow for
non-browser clients) added to both `POST` handlers, returning
`403 Cross-origin request rejected.` on mismatch.

**Verification:** existing route tests extended (the invalid-JSON test
previously passed a bare string as a `Request` — now a real `Request`),
38/38 route tests pass.

### 2. Caregiver share links exposed to search engines (Medium — privacy)

**Where:** `src/app/caregiver/[token]/page.tsx`

**Scenario:** The read-only caregiver page renders health context
(cycle phase, forecast) and is reachable by anyone holding the share
URL. The page shipped no `robots` metadata, so search engines could
index these URLs and social crawlers could generate rich previews —
leaking that a specific person uses a fibromyalgia tracker, tied to
their name, into public search results. Share links are meant to travel
by private message, not by crawler.

**Fix:** `metadata` export with `robots: { index: false, follow: false }`
plus a `googlebot: noindex, nofollow, noarchive` directive — the page
drops out of indexes, archives, and link-following.

**Verification:** build renders the metadata; route still registered in
`app-path-routes-manifest.json`.

### 3. Unauthenticated token endpoint without guess-resistance (Low→Medium)

**Where:** `src/app/actions.ts` → `getCaregiverForecast()`

**Scenario:** The caregiver endpoint is public by design (no session —
the caregiver doesn't have an account). Tokens are 122-bit UUIDs, so
straight guessing is impractical — but the endpoint performed one
database lookup per attempt with **no rate limit**, giving a scripted
enumerator a free oracle for token validity and an unbounded amplification
path against the database.

**Fix:** Per-IP budget of 30 token attempts / 15 minutes via the existing
distributed rate limiter (`checkRateLimitDistributed`), keyed
`caregiver-token:<ip>` and reusing the edge-safe `getClientIp()` helper.
A legitimate caregiver opening their shared link stays orders of
magnitude under the cap; scripted enumeration is capped and the
error string is identical to an inactive link (no oracle).

**Verification:** manual probe sequence; limiter is the same
battle-tested path used by login and password reset.

### 4. Secret-shaped fixture strings in a test file (Low — hygiene)

**Where:** `src/lib/billing/webhook.test.ts`

**Scenario:** The Stripe/Lemon Squeezy webhook tests hardcode
`whsec_stripe_test_secret` / `whsec_lemon_test_secret` — obviously fake,
but credential-shaped. Any secret scanner (including the repo's own new
gate, CIlints, or a future automated audit) flags these as leaks, and
normalizing "ignore that one" erodes scan quality.

**Fix:** Inline `// security: ok test fixture` markers (the scanner's
documented opt-out) plus a comment naming the fixtures as fake. The
suppression remains visible in every scan log.

**Verification:** `npm run check:security` passes with the suppression
listed in the log.

---

## What was audited and found solid

Worth recording what was checked and *not* flagged, so future audits
start from this baseline instead of rediscovering it:

- **Route protection (middleware)** — fail-closed. `getToken` actually
  verifies the JWT (A256GCM); a forged cookie is rejected, and a
  decryption error clears the cookie and redirects rather than serving
  the page shell. Cookie name is pinned to match `src/lib/auth.ts`
  (the `__Secure-` prefix mismatch that used to break Vercel sessions
  is documented and handled).
- **Authentication** — bcrypt password hashing; per-account lockout
  (10 attempts / 15 min) plus a parallel per-IP budget; generic 401s
  everywhere (no account-existence oracle); password reset performs a
  dummy hash for unknown emails so timing is uniform, stores only
  SHA-256 token hashes, and never returns the reset link in production.
- **Privacy PIN** — server-side authority: bcrypt of `<userId>:<pin>`,
  unlock via HMAC-signed httpOnly cookie set only after PIN/biometric
  verification, failure lockout, and `isActionLocked()` checks on every
  sensitive read/write.
- **Authorization** — RBAC resolved from the DB role (never the JWT
  shape); `requirePermissionResponse` gates AI/billing features;
  consultation-scoped patient access checks on doctor endpoints;
  ownership-scoped deletes with idempotent `deleteMany`.
- **Billing webhook** — HMAC-SHA256 signature verification with replay
  window (Stripe) and constant-time comparison; unverified payloads
  never touch the database; all body fields narrowed with runtime
  `typeof` checks.
- **Injection & XSS** — Prisma parameterizes every query; user text
  passes `sanitizeUserText` (entity decoding, block-level tag removal,
  `javascript:`/`data:` scheme stripping, control/bidi-override
  removal) before persistence; markdown rendering uses `react-markdown`
  without `rehypeRaw`; JSON-LD in the root layout is built from static
  data only.
- **AI layer (OWASP LLM / MITRE ATLAS)** — patient text is delimited
  and marked DATA-not-instructions; `sanitizeForPrompt` strips
  instruction-boundary mimics and override phrasing; client-supplied
  memory is Zod-validated server-side before entering prompts; the
  agent exposes a single read-only health-snapshot tool scoped to the
  session user; per-user chat/feature rate limits plus daily/monthly
  spend budgets; output passes medical guardrails and HTML stripping
  before streaming. `AI_MOCK_MODE` cannot auto-enable in production.
- **Secrets** — no hardcoded credentials (automated scan: 691 tracked
  files); `.env*` gitignored; provider keys resolve server-side only;
  `npm audit` reports 0 vulnerabilities at the high threshold.
- **Security headers** — strict CSP (`frame-ancestors 'none'`,
  `connect-src 'self'`, frame allowlist of exactly two video hosts),
  HSTS preload, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  restrictive `Permissions-Policy`, no CORS headers anywhere.
- **PWA** — the navigation cache rejects non-200 and redirected
  responses, so the login page can never be cached under a protected
  URL; auth-gated routes are deliberately excluded from the precache
  manifest; the Workbox runtime is self-hosted (no CDN dependency).

## Hardening notes (not findings)

Recorded for the next pass — none are exploitable today:

- **Client IP trust**: `getClientIp()` reads `x-forwarded-for` directly.
  Correct behind Vercel/Azure (which overwrite it), but a self-managed
  proxy without header sanitization would let clients spoof their rate
  -limit identity. Deployment-model caveat, not a code bug.
- **CSP `unsafe-inline`**: required by Next.js hydration bootstrap; a
  nonce-based policy would need response rewriting in middleware
  (documented in `next.config.ts`).
- **Chat message array**: per-message and window character budgets are
  enforced after JSON parse; a hard element-count cap before parsing
  would bound allocation further.

## Ongoing enforcement

`npm run check:security` (`scripts/check-security.mjs`) now runs in CI
as `.github/workflows/security-check.yml` on every PR and push to main:

- **Layer 1** — secret-pattern scan over every tracked text file
  (provider API keys, cloud credentials, private key blocks, Postgres
  URLs with passwords, generic secret assignments). Suppressions via
  inline `// security: ok <reason>` or placeholder values stay visible
  in the log.
- **Layer 2** — `npm audit` gate failing at/above the configured
  severity (default high).

Re-run locally anytime; the scan exits non-zero on findings so it can
gate any pipeline.

---

*Report generated 2026-09-18. Remediation verified with
`tsc --noEmit` (clean), `vitest` 993/993 across 106 files, and a clean
production build with all routes registered.*
