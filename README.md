# FibroCare

**Developed & Created with ❤️ by Mariam Mahmoud Elboriae (mariam423).**

---

<div align="center">

# 🌿 FibroCare — With you in every step

**Your calm companion for chronic pain management, symptom tracking, and psychological support.**

---

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white&style=for-the-badge)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white&style=for-the-badge)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss&logoColor=white&style=for-the-badge)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![Tests](https://img.shields.io/badge/Tests-993%20passing-6ba539?logo=vitest&logoColor=white&style=for-the-badge)](#testing)
[![PWA](https://img.shields.io/badge/PWA-Ready-8fbf9b?logo=pwa&logoColor=white&style=for-the-badge)](#progressive-web-app)

</div>

<p align="center">
  <img src="./assets/fibrocare-repo-demo.gif" alt="FibroCare product walkthrough — landing page, resources library, and citation dialog" width="860" />
</p>

<p align="center">
  <strong>FibroCare</strong> — a calm, bilingual companion for living with fibromyalgia.<br />
  Track pain and flares, browse a curated care library, chat with a RAG-grounded clinical assistant — all offline-ready and on-device.
</p>

---

## 🆕 What's new — September 2026

This release is all about **practical, in-the-moment help** — tools you can actually open mid-flare, on a low-energy morning, or in a doctor's waiting room:

- **🧠 Fog Shield** (`/fog-shield`) — an emergency module for fibro-fog episodes: guided sensory-reset breathing with a **Three.js calm sphere** that visibly clears as you progress, a secure brain-dump box, and a micro-task breaker that shrinks any overwhelming task into three tiny steps. Includes its own SOS mode.
- **🆘 SOS floating button** — visible on the dashboard and inner pages (hidden on the landing page and auth routes), with a small dismiss (X) mark. One tap opens a crisis overlay with a paced breathing countdown, a pre-formatted emergency message ready to share with family or doctors, and high-contrast guidance for dizziness and disorientation.
- **🥄 Spoon Theory daily check-in** — a morning prompt asks how many energy spoons you have (1–10), saves it to the database, and puts the dashboard into **Energy Saving Mode** when you're running on empty (≤3 spoons): secondary tasks step aside and rest is prioritized.
- **🩺 Clinical Hub** (`/clinical`) — one dashboard for the whole clinical toolkit: flare triggers, labs, medications, ACR assessment, plus a low-impact exercise library, sleep hygiene guidance, and a coping toolkit with an interactive 4-7-8 breathing exercise.
- **📈 Weekly/Monthly report** — aggregates pain logs, cycle data, triggers, and meds into a doctor-ready summary.
- **🥗 Pantry meal helper** (in `/diet`) — tick what's actually in your kitchen and get 5-minute anti-inflammatory meal ideas, ordered by match. No decision fatigue on bad days.
- **👨‍👩‍👧 Family support cards** — pre-written, copyable explainers for "what a flare looks like" and "what brain fog feels like", so you stop having to explain from scratch.
- **🧘 Gentle movement reminders** — soft micro-stretch nudges during long sessions, with a snooze — never a nag.
- **📑 One-page medical summary** (in `/reports`) — a print-ready month view of pain, cycle days, sleep quality, and medications, designed to survive brain fog in a doctor's office.
- **🔍 Advanced feed filters** — search, topic tags, and sorting in the doctor social feed.

Everything ships bilingually (Arabic/RTL + English/LTR) with the same test coverage bar as the rest of the app.

📖 **A detailed tour of the crisis and clinical modules** — what each tool does, when to reach for it, and how it works — lives in [`FEATURES.md`](./FEATURES.md), with a full [Arabic mirror](./FEATURES_AR.md) (`FEATURES_AR.md`).

---

## 🚦 Recent Major Upgrade

FibroCare shipped a **non-destructive major upgrade** to its backend scalability story:

- **Distributed rate limiting** via [Upstash Redis](https://upstash.com) — sliding-window budgets shared across every server instance (chat: 20/min/user, AI features: 10/min/user, article generation: 1/10s per topic+language).
- **Distributed LLM cache** via Upstash — repeated calls with the same prompt fingerprint hit Redis, not the provider.
- **Prisma Accelerate** support — opt-in connection pooling + edge query cache, no code change required to enable.
- **5 new database indexes** — `User(role)`, `User(signupRole)`, `User(createdAt)`, `ArticleReaction(userId)`, and the composite `ConsultationMessage(consultationId, createdAt)`.
- **AI provider circuit breaker** — 5 consecutive failures opens for 60 s, preventing cascading 502s when Gemini/OpenAI/Anthropic is flaky.
- **Admin-gated `/api/health`** — single endpoint reports which adapters are active, breaker state, and in-process metrics.

**All distributed adapters are opt-in via env vars.** With nothing configured, every route returns byte-identical responses to pre-upgrade. See [`DEPLOY.md`](./DEPLOY.md) for the env-var matrix and [`docs/upgrade-2026-09.md`](./docs/upgrade-2026-09.md) for the architectural rationale.

---

## 📖 Overview

FibroCare is a **modern, AI-powered Progressive Web Application** designed for individuals living with chronic pain conditions — particularly fibromyalgia. It provides a calm, responsive, and deeply personalized environment for:

- **Daily symptom and pain tracking** with telemetry dashboards
- **In-the-moment crisis support** — SOS button, fog shield, and guided breathing that work when you can barely think
- **Psychological support** through guided breathing, mindfulness prompts, and motivation widgets
- **AI-assisted health insights** grounded in clinical sources with zero-hallucination policies
- **Bilingual Arabic/English** support with full RTL layout handling

Built on **Next.js 16** with **React 19**, **Tailwind CSS 4**, and **TypeScript 5**, FibroCare installs as a **PWA** and works offline — keeping your health data private and accessible whenever you need it.

---

## ✨ Core Features

### 🆘 Crisis & Fog Support
- **SOS Floating Button** — a persistent, accessible action button on the dashboard and inner pages (with a small dismiss X) opening a full crisis overlay: breathing countdown, shareable emergency message, and large-type dizziness guidance.
- **Fog Shield** — sensory-reset breathing with a Three.js calm sphere that clears as you progress, plus a brain-dump box and a 3-step micro-task breaker. Every session is logged (intensity, coping tools used) so you can spot fog patterns later.
- **Guided Breathing Timer** — paced breathing with visual cues and gentle audio prompts, both in the toolkit and inside the SOS overlay.

### 🧘 Motivation & Psychological Support
- **Dynamic bilingual Motivation Widget** — rotating Quranic verses, Hadiths, and Hikmah (wisdom sayings) rendered in both Arabic and English with smooth animated transitions.
- **Spoon Energy Tracker** — morning spoon check-in (1–10), 7-day trend, and automatic **Energy Saving Mode** when the day starts critically low.
- **Family Support Cards** — one-tap copy/share explainers for flares, fog, and crashes, pre-formatted so loved ones understand without a medical dictionary.

### 📊 Advanced Health Telemetry
- **Comprehensive Pain Dashboard** — interactive charts (Recharts) tracking pain levels, fatigue, sleep quality, mood, and medication adherence over time.
- **Post-Meal Fatigue & Symptom Tracking** — log how meals affect symptoms, with meal type selection and a five-level fatigue scale.
- **Dietary Trigger Tracking & Correlation** — flare triggers get logged and cross-referenced with meals on `/diet`, surfacing personal trigger patterns.
- **Flare Detection & Weather Correlation** — OpenWeather API integration cross-referenced with logged flares, with barometric pressure trend analysis and deterministic fallback when live data is unavailable.

### 🩺 Clinical Hub & Reporting
- **Clinical Trackers** — flare triggers, lab results, medications & supplements, and the ACR assessment, all in one hub at `/clinical`.
- **Low-Impact Exercise Library** — fibromyalgia-appropriate movement guides filtered by body area and intensity, paced for post-exertional malaise.
- **Sleep Hygiene Guidance** — structured, trackable sleep practices for fibro insomnia.
- **Weekly/Monthly Report** — aggregated, doctor-ready summaries built from your logs, cycle data, and meds.
- **Printable One-Page Medical Summary** — a month of pain, cycle, sleep, and medication data formatted to survive a foggy waiting room.
- **Automated Arabic & English PDF Reports** — 30-day health reports and flare analyses via jsPDF with full RTL support.

### 🤖 AI-Powered Assistance
- **Personalized AI Chat & Assistant** — conversational guidance powered by Vercel AI SDK with support for OpenAI, Anthropic Claude, and Google Gemini providers.
- **RAG-Grounded Insights** — all AI outputs are grounded in verified clinical sources (ACR, Mayo Clinic, NHS, EULAR) with a zero-hallucination policy.
- **1-Minute Summaries** — every resource page opens with a three-bullet AI takeaway written for cognitive fatigue, with a one-tap "Explain like I'm foggy" toggle.

### 🌍 Localization & Privacy
- **Full Arabic/English i18n** — 2,000+ translation keys with dynamic locale switching, RTL logical properties (`ms-*`/`me-*`), and `<bdi>` isolation for embedded Latin text.
- **Privacy PIN Lock** — 4-digit PIN gate for sensitive health data with encrypted session tokens; protected routes enforced in middleware.
- **Progressive Web App** — installs to your home screen with service worker caching and offline fallback pages.

### 🧪 Quality & Testing
- **Comprehensive Test Suites** — 993 Vitest unit tests across 106 files, plus Playwright end-to-end tests covering auth flows, API routes, and UI interactions.
- **Accessibility Auditing** — automated a11y CSS guards in CI, reduced-motion support, and contrast-sensitive design modes.

---

## 📸 Screenshots

Here is a quick look at the **FibroCare** interface:

### Homepage / Loading
![Loading Page](public/images/Loading%20page.png)

### Health Tracking
![Health Tracking](public/images/Health%20Tracking.png)

### Weekly Progress & Analytics
![Weekly Progress & Analytics](public/images/Weekly%20Progress%20&%20Analytics.png)

### AI Clinical Insights
![AI Clinical Insights](public/images/AI%20Clinical%20Insights.png)

### Care Resources
![Care Resources](public/images/Care%20Resources.png)

### Toolkit
![Toolkit](public/images/Toolkit.png)

### Fog Shield — emergency fog support with 3D calm sphere
![Fog Shield](public/images/fog-shield.png)

### Clinical Hub — trackers, exercise library, and reports in one place
![Clinical Hub](public/images/clinical-hub.png)

### SOS Crisis Overlay — breathing countdown and emergency message
![SOS Modal](public/images/sos-modal.png)

### Diet Pantry Helper — 5-minute anti-inflammatory meal ideas
![Diet Pantry](public/images/diet-pantry.png)

### Medical Summary — print-ready doctor visit sheet
![Medical Summary](public/images/medical-summary.png)

### Doctor Hub
![Doctor Hub](public/images/Doctor%20Hub.png)

### Bilingual support — the same pages in Arabic (full RTL)
> FibroCare is built for Arabic speakers first: every screen — including the crisis and clinical tools — renders natively in Arabic with proper right-to-left layout, not a translated afterthought. The server renders the chosen language from the start, so there's no flash of English before the Arabic appears.

| | |
|:---:|:---:|
| ![Fog Shield — Arabic](public/images/fog-shield-ar.png) | ![Clinical Hub — Arabic](public/images/clinical-hub-ar.png) |
| *درع الضباب — Fog Shield* | *المركز الإكلينيكي — Clinical Hub* |
| ![SOS Modal — Arabic](public/images/sos-modal-ar.png) | ![Diet Pantry — Arabic](public/images/diet-pantry-ar.png) |
| *نافذة SOS — SOS Modal* | *مساعد البانتري — Diet Pantry* |
| ![Medical Summary — Arabic](public/images/medical-summary-ar.png) | |
| *الملخص الطبي — Medical Summary* | |

### Login
![Login](public/images/Log%20in.jpeg)

> The walkthrough GIF at the top of this README is auto-generated. To
> regenerate the demo GIF or capture the feature screenshots (requires
> Playwright + Chromium):
>
> ```bash
> npm run demo:all                  # capture frames + compose animated GIF
> node scripts/capture-features.mjs # capture the feature screenshots above
> ```
>
> Output: `assets/fibrocare-repo-demo.gif` (README hero) and PNGs in
> `public/images/`.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) + React 19 | Server-side rendering, API routes, streaming |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type safety, developer experience |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + Framer Motion | Responsive design, glassmorphism, animations |
| **3D Graphics** | [Three.js](https://threejs.org/) | Fog Shield calm-resonance sphere |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + Recharts | Accessible components, data visualization |
| **Database** | [Prisma](https://www.prisma.io/) ORM + [PostgreSQL](https://www.postgresql.org/) (Neon-ready) | Type-safe queries, serverless-friendly pooling |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (v4) | JWT sessions, credentials + OAuth (Google/GitHub) |
| **AI/RAG** | [Vercel AI SDK](https://sdk.vercel.ai/) | Multi-provider LLM chat (OpenAI, Anthropic, Gemini) |
| **Rate Limiting** | [Upstash Redis](https://upstash.com/) (opt-in) | Distributed rate limits and LLM caching |
| **Weather** | [OpenWeather API](https://openweathermap.org/) | Live weather data with deterministic fallback |
| **PDF Generation** | [jsPDF](https://www.npmjs.com/package/jspdf) + jspdf-autotable | Arabic/English health reports |
| **Testing** | [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) | Unit tests, E2E browser tests |
| **PWA** | Service Worker + Manifest | Offline support, installability |
| **Deployment** | [Vercel](https://vercel.com/) | Serverless functions, edge network |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm/yarn)
- **Git**
- A **PostgreSQL** database (local, or a free [Neon](https://neon.tech) instance)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mariam423/fibrocare.git
cd fibrocare

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Apply database migrations
npm run db:migrate:pg
```

### Environment Variables

Create a `.env.local` file at the project root. The only hard requirement is a Postgres connection string — everything else degrades gracefully:

```env
# ── Database (required — PostgreSQL, Neon-ready) ──
# Replace user/password/host with your real Neon credentials.
DATABASE_URL="postgresql://user:password@host:5432/fibrocare" # security: ok placeholder

# ── Site URL (for SEO and social metadata) ──
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── Weather (optional — dashboard falls back to deterministic estimates) ──
OPENWEATHER_API_KEY=your_openweather_api_key
OPENWEATHER_CITY=London

# ── AI Care Companion (optional — any ONE key enables live chat) ──
# GEMINI_API_KEY=...        # recommended — free tier available
# OPENAI_API_KEY=...
# ANTHROPIC_API_KEY=...

# ── Auth (optional — enables Google/GitHub sign-in) ──
# NEXTAUTH_SECRET=your_random_secret_string
# NEXTAUTH_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GITHUB_CLIENT_ID=...
# GITHUB_CLIENT_SECRET=...

# ── Distributed scale-out (optional — see DEPLOY.md for the full matrix) ──
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...
```

### Run Development Server

```bash
# Start the dev server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

```bash
# Run full Vitest unit test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run Playwright end-to-end tests
npm run test:e2e

# Run tests against live AI providers
npm run test:e2e:live

# Run the REAL-provider AI chat e2e (no mocks; needs GEMINI_API_KEY in .env.local)
npm run test:e2e:live-chat

# Type-check the project
npx tsc --noEmit

# Lint
npm run lint

# Full production build + PWA service worker
npm run build

# Accessibility audit
npm run check:a11y
```

### Scheduled CI: real-provider chat verification (`live-chat-e2e`)

`.github/workflows/live-chat-e2e.yml` runs the real-provider chat suite
(`playwright.live-chat.config.ts`) **weekly, Sundays 03:00 UTC**, plus on
demand via **Run workflow** on the Actions tab. It exercises the full live
stack — auth → companion → `/api/chat` → real Gemini call → guardrail
stream → UI render — and the session-recovery flow (401 → banner → login
redirect).

The job **skips gracefully when the `GEMINI_API_KEY` repository secret is
absent** (e.g. forks). To enable it:

1. Get a free key at [Google AI Studio](https://aistudio.google.com/apikey)
   (no credit card needed).
2. In your repository: **Settings → Secrets and variables → Actions →
   New repository secret**.
3. Name: `GEMINI_API_KEY` — Value: your key.
4. Verify via the Actions tab → **live-chat-e2e** → **Run workflow**; the
   "Check provider secret" guard should report the key and the e2e job
   should run instead of being skipped.

The key is used only by the e2e job (`AI_MOCK_MODE=false` forces the real
provider path); it is never written to `.env` or build artifacts.

---

## 🏗️ Project Structure

```
fibrocare/
├── public/                    # Static assets (images, icons, fonts)
│   └── images/                # Screenshots and resource illustrations
├── src/
│   ├── app/                   # Next.js App Router pages & layouts
│   │   ├── api/               # API route handlers (ai/, auth/, chat/, health/, …)
│   │   ├── dashboard/         # Main health dashboard
│   │   ├── clinical/          # Clinical hub — trackers + Phase 3/4 modules
│   │   ├── fog-shield/        # Fibro-fog emergency module
│   │   ├── health-logs/       # Symptom and pain logging
│   │   ├── diet/              # Nutrition, pantry helper, trigger correlation
│   │   ├── reports/           # PDF reports + medical summary
│   │   ├── resources/         # Educational content (About, FAQ, etc.)
│   │   ├── toolkit/           # Self-care toolkit (timers, exercises)
│   │   ├── pro/               # Doctor/professional portal + social feed
│   │   ├── profile/           # User profile management
│   │   ├── zen/               # Zen mindfulness portal
│   │   └── og/                # Open Graph image generation
│   ├── components/
│   │   ├── clinical/          # Trackers, exercise library, sleep, coping, reports
│   │   ├── fog/               # Fog shield view, breathing reset, brain dump, SOS
│   │   ├── sos/               # Floating SOS button + crisis overlay
│   │   ├── support/           # Family support cards, movement reminders
│   │   ├── health/            # Spoon check-in, cycle dashboard, widgets
│   │   └── pro/               # Doctor social feed + advanced filters
│   ├── context/               # React context providers (language, …)
│   ├── lib/
│   │   ├── clinical/          # Pure engines: exercise, sleep, coping, reports, spoon
│   │   └── diet/              # Pantry meal engine
│   └── middleware.ts          # Route protection (PIN/session-gated prefixes)
├── prisma/                    # Database schema + migrations (PostgreSQL)
├── scripts/                   # Build scripts, E2E runners, demo capture, a11y audits
└── next.config.ts             # Next.js configuration (CSP, security headers)
```

---

## 🤝 Contributing

Contributions are welcome! FibroCare is built with care for the chronic pain community, and we appreciate help improving the experience.

### Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Before Submitting

```bash
npm test              # Ensure all unit tests pass
npm run test:e2e      # Run E2E tests
npx tsc --noEmit      # Verify no type errors
npm run build         # Confirm production build succeeds
```

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `refactor:` — code restructuring without behavior change
- `test:` — adding or updating tests
- `chore:` — build, CI, or dependency changes

---

## ⚕️ Medical Disclaimer

> **FibroCare is a wellness and self-tracking tool — not a medical device, and never a substitute for professional care.** It does not diagnose, treat, or cure fibromyalgia. Always consult your physician or qualified healthcare provider about your symptoms and treatment plan.

AI-generated content is grounded in and cited against established clinical frameworks including ACR, Mayo Clinic, NHS, and EULAR guidelines. Where a claim cannot be verified, FibroCare shows a safe general note instead of generating ungrounded advice.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**Built with care by [@mariam423](https://github.com/mariam423).** If this project helped you, a ⭐ is the best way to say thanks.

[⬆ Back to top](#-fibrocare--with-you-in-every-step)

</div>
