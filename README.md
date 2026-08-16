This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## AI Care Companion (LLM features)

The dashboard ships with live AI features powered by the Vercel AI SDK, wired
provider-agnostically so the model is swappable from environment variables:

- **AI Care Companion** — a floating, streaming chat that already knows the
  user's recent logs, symptoms, flare days and streak (injected as a private
  health snapshot). Empathetic-by-design: banned empty-empathy phrases,
  fibromyalgia-aware pacing advice, and explicit escalation rules for
  crisis/emergency mentions.
- **Your patterns, in plain words** — streams a warm, human explanation of
  the detected data patterns under the AI Care Insight card.
- **Reflect with AI** — an empathetic reflection on the daily journal note.
- **AI doctor questions** — zod-validated, data-grounded questions generated
  from the real logs inside the Smart Medical Summary.

### Setup (one provider key is enough)

```bash
# Google Gemini (recommended, free tier usable in production, no card needed)
# Get a key at https://aistudio.google.com/apikey
AI_PROVIDER=google
GEMINI_API_KEY=your_key

# …or OpenAI / Anthropic
# OPENAI_API_KEY=...      # default model gpt-4o-mini
# ANTHROPIC_API_KEY=...   # default model claude-haiku-4-5
# AI_MODEL=...            # optional override
```

See `.env.example`. Without any key the app stays fully functional in
**offline mode**: the deterministic insight engines power the dashboard and
AI surfaces show a graceful hint instead of breaking.

### Mock mode (no key, interactive companion)

For local testing, set `AI_MOCK_MODE=true` and the AI Care Companion — plus
narration, reflection and doctor questions — run **online with simulated,
snapshot-grounded replies** over the same streaming protocol (no real LLM is
called, and the UI labels it as mock). Leave it unset and it auto-enables in
non-production when no key is configured; it never auto-enables in
production, so a deployed app without keys stays honestly offline. In any
environment where real AI is expected, set `AI_MOCK_MODE=false` explicitly —
and note that a real provider key always takes precedence over the mock
default.

Engineering notes: keys never reach the client (all calls proxy through
server routes); every request is auth-scoped, rate-limited (in-memory sliding
window) and timeout-bounded; doctor questions are cached by data fingerprint;
usage (tokens + model) is logged per call; streaming UI respects
`prefers-reduced-motion`.

## Accessibility & Build Verification

FibroCare's glass / 2.5D visual system ships with two complementary checks:

- **A static CSS guard** (`scripts/check-a11y-css.mjs`) — fast, dependency-free, and wired into `prebuild` so every `npm run build` fails fast if the accessibility escapes are removed from `src/app/globals.css`.
- **A runtime audit** (`scripts/a11y-audit.py`) — a Playwright/CDP browser audit that verifies the actual rendered page under emulated `prefers-reduced-transparency` and `prefers-contrast: more`, in both light and dark themes.

| Command | What it does |
|---|---|
| `npm run build` | Compiles the app **and** runs the static CSS guard automatically (`prebuild` hook). |
| `npm run check:a11y:css` | Run the static CSS guard on its own. |
| `npm run check:a11y` | Run the runtime audit against the public pages (`/login`, `/forgot-password`, `/resources`). |
| `npm run check:a11y:full` | Runtime audit **plus** authenticated pages (`/`, `/health-logs`, `/profile`) using a throwaway account. |
| `npm run build:verify` | Full gate: `npm run build` followed by `npm run check:a11y`. |
| `npm run prod-audit` | Strictest gate: `next build`, serve with `next start`, then audit the **production** bundle (incl. authenticated pages). |

### Static CSS guard (`npm run check:a11y:css`)

Scans `src/app/globals.css` for the media-query fallbacks that keep the design system accessible: `prefers-reduced-transparency`, `prefers-contrast: more`, the `.ambient` wash being dropped in **both** light and dark (including the `.dark .ambient` specificity trap), `.glass-surface` going opaque with `backdrop-filter` removed, the `@supports` escape for browsers without `backdrop-filter`, and the reduced-motion guards for scroll-reveal. Exit code 0 = pass, 1 = one or more guards missing.

### Runtime audit (`npm run check:a11y` / `npm run check:a11y:full`)

**Prerequisites:**

```bash
pip install playwright
python -m playwright install chromium
```

The audit reuses a dev server already running on port 3000, or starts one itself (and shuts it down afterwards). Use `--port` or the `AUDIT_PORT` env var to target a different port:

```bash
npm run check:a11y -- --port 3100
AUDIT_PORT=3100 npm run check:a11y:full
```

For each page it checks, across **4 modes** (light, dark, reduced-transparency + high-contrast × light/dark):

- The `.ambient` gradient wash is removed (no decorative background under reduced transparency).
- Glass surfaces become opaque and drop `backdrop-filter`.
- **WCAG AA contrast ≥ 4.5:1** for body text, muted text, headings, card titles, primary links, and form fields/placeholders — measured with a canvas-rasterized color parser that reads Chrome's real `lab()/oklab()` values and composites translucency correctly.
- **Zero console errors.**

`--full` additionally signs in (or creates, on first run) a throwaway audit account (`a11y.audit@fibrocare.local`) and audits the authenticated dashboard, health-logs, and profile pages.

### Production audit (`npm run prod-audit`)

One command that builds the production bundle, serves it with `next start` on port 3100 (override with `AUDIT_PORT`), and runs the audit against it with `--full`. The server is shut down afterwards — even if a step fails. If something is already listening on the port it is reused and left running. This is the strictest gate: because React does not log hydration mismatches in production, the zero-console-error check has no dev-only noise. Set `AUDIT_FULL=0` to skip the authenticated portion:

```bash
npm run prod-audit
AUDIT_PORT=3200 npm run prod-audit
AUDIT_FULL=0 npm run prod-audit
```

### Live AI mode e2e check

`npm run test:e2e:live` starts a dedicated dev server on port 3101 with a
**fake** `GEMINI_API_KEY` injected into its env (`playwright.live.config.ts`)
and verifies the AI Care Companion surfaces render `Live · Gemini` — proving
`GEMINI_API_KEY` → server action → header badge / companion status wiring
end to end. The key is fake and the spec never triggers a real provider call,
so it is safe to run anywhere. Override the port with `LIVE_E2E_PORT=3102`.

### PWA & offline support

The service worker is **generated at build time** by `scripts/build-sw.mjs`
(Workbox `injectManifest`): every `next build` writes `public/sw.js` plus the
self-hosted Workbox runtime to `public/workbox/` (no CDN dependency). The
precache contains:

- every content-hashed `/_next/static` chunk (JS/CSS/fonts/media), so **a
  fresh install works offline with no prior online visit**;
- the public shell pages `/`, `/resources`, `/resources/exercises` and
  `/offline` (revisioned per build);
- all static `public/` assets (fonts, icons, images, `manifest.json`).

Auth-gated routes are deliberately **not** precached (a logged-out install
must never cache the login page under a protected URL); they are cached via a
network-first navigation strategy only after a successful authenticated
visit, and offline they fall back to the styled `/offline` page.

Commands:

| Command | What it does |
|---|---|
| `npm run build` | `next build` **then** regenerates `public/sw.js` (`build:sw`). |
| `npm run build:sw` | Regenerate `public/sw.js` from the last build on its own. |
| `npm run check:pwa` | Static gate: manifest fields, icon files, Workbox runtime, precache shell URLs + auth-gated exclusion. |
| `npm run test:e2e:pwa` | Production build + Playwright spec: SW registration/activation, precache contents (incl. hashed chunks), manifest installability, offline precached-page serving and uncached-route → `/offline` fallback. |

The service worker is a **production artifact**: it is only generated by a
build, and its manifest references the hashed chunks of that build — so test
PWA/offline behavior with `npm run test:e2e:pwa` (or any `next build`)
rather than `next dev`, where the last built `sw.js` would not match the dev
chunks.

### Notes & caveats

- React logs hydration mismatches as `console.error` **only in dev**, so a dev-only mismatch can trip the zero-console-error check that a production build would pass. If that happens, verify against `next build` + `next start` before treating it as a regression.
- The language preference is SSR-aware: it lives in a `fibrocare-locale` cookie that the root layout reads so `lang`/`dir` and the translated strings are identical on the server and the client — no hydration mismatch when an Arabic preference is persisted. (A pre-cookie `localStorage` preference is migrated into the cookie on first visit.)
- The audit disables CSS transitions/animations before measuring so the 500ms theme-switch color fade can't be read mid-flight (a known source of false ~1.3:1 contrast failures).
- Old Chromium builds (< 118) that don't support the reduced-transparency CDP feature skip those specific checks (reported in the output) rather than false-failing.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
