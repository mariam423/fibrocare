# 🌿 FibroCare (معك في كل خطوة)

> معك في كل خطوة — *with you at every step.*

**FibroCare** is a modern, AI/RAG-assisted web application for managing Fibromyalgia. Built with **Next.js**, **Tailwind CSS**, and **TypeScript**, it turns daily pain-and-energy tracking into calm, actionable support: grounded AI summaries you can actually read during brain fog, a doctor-ready diagnosis checklist, gentle movement timers with energy-cost awareness, and full Arabic/English localization that renders flawlessly in RTL.

It installs as a **PWA**, works offline, and keeps your data private — on-device by default.

---

## ✨ Badges

![Next.js 14+](https://img.shields.io/badge/Next.js-14%2B-black?logo=next.js&logoColor=white)
![Tailwind CSS 3.4+](https://img.shields.io/badge/Tailwind%20CSS-3.4%2B-38bdf8?logo=tailwindcss&logoColor=white)
![TypeScript 5.0+](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?logo=typescript&logoColor=white)
![Vitest 100% Passed](https://img.shields.io/badge/Vitest-100%25%20Passed-6ba539?logo=vitest&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-8fbf9b?logo=pwa&logoColor=white)

---

## 🧠 Feature Breakdown

### AI & Brain-Fog Friendly Design
Everything AI is built around one rule: *readable in 30 seconds, even when your brain is foggy.*

- **⚡ AI 1-Minute Summaries** — every resource page (About, Diagnosis, Treatment, Nutrition, Exercises, FAQ, Community) opens with a three-bullet takeaway written for cognitive fatigue, with a one-tap "Explain like I'm foggy" plain-language toggle.
- **🩺 ACR Diagnosis Readiness Checker** — an interactive self-check mirroring the ACR 2010 criteria (WPI, SSS, duration, exclusion) with a verdict, a copyable summary for your doctor, and a **downloadable PDF report** (Arabic RTL included).
- **📚 RAG Citations, Zero Hallucination** — all AI outputs (summaries, action plans, meal swaps, FAQ answers) are grounded in a local **RAG knowledge base** retrieved from verified guidelines (ACR, Mayo Clinic, NHS, EULAR, Arthritis Foundation). Every claim carries a "Verified Source" badge; when a query can't be verified, the app shows a safe offline note instead of guessing.
- **🔎 Semantic FAQ Search** — ask in your own words ("Is heat therapy safe for morning stiffness?" or "كم يستغرق التشخيص؟") and the FAQ accordion ranks and auto-opens the best-matching answer.

### Triage, Self-Care & Tracking
- **⏱️ Interactive Stretch Timers** — stretching and walking guides include built-in countdown timers with soft audio cues, so you never have to watch the clock mid-stretch.
- **🥄 Energy Spoon Cost** — every activity shows its estimated spoon cost ("1 Spoon" / "2 Spoons") so pacing decisions happen before you start, not after you crash.
- **🍎 Smart Nutrition & Trigger Swap** — bookmark the safe foods that work for you (persisted on-device) and get grounded "suggest a swap" replacements for triggering ingredients, with reasons and citations.
- **💬 Community with Auto-Translation** — a moderated-feel community feed with category filters (Stories / Tips / Encouragement) and a one-tap **AI Translate Post** toggle that flips curated content between Arabic and English.
- **📋 Quick-Add to Tracker** — log a self-care strategy, a med, or a movement session straight into your daily health log from the Treatment page.
- **🌦️ Weather-Aware Flares** — local humidity/pressure/temperature is compared against your logged flares, with a flare mode that dims the UI, starts paced breathing, and plays offline calming audio.

### i18n & Bidi Isolation
- **🌍 Full Arabic/English Localization** — every string in the app flows through `src/lib/translations.ts` (700+ keys per language); toggling the locale re-renders the entire interface, including content, buttons, toasts, and PDFs.
- **↔️ RTL Dynamic Logical Properties** — layouts use `ms-*`/`me-*`/`ps-*`/`pe-*`/`gap-*` instead of physical `ml-*`/`mr-*`, so the whole UI mirrors cleanly under `dir="rtl"` without a single conditional class.
- **🔤 `<bdi>` Wrappers** — numbers, percentages, medical acronyms (`ACR`, `WPI`, `CBC`), and Latin names are isolated with `<bdi>` (via a tested tokenizer) so punctuation never flips or glitches inside Arabic sentences.

---

## 🎨 Aesthetics & Palette

**Midnight Emerald & Slate** — a calm, premium dark theme built for sensory-sensitive users.

- **Base:** deep slate obsidian (`slate-900`) with translucent **glassmorphic panels** — `backdrop-blur-xl`, `bg-slate-900/60`, hairline `emerald-500/20` borders, and layered `shadow-emerald-950/20` elevation.
- **Accent:** soft emerald (`#8FBF9B` dark / `#3B6B48` light) for actions, badges, and verified-source marks — never jarring.
- **Typography:** Readex Pro (Latin + Arabic) app-wide, with Arabic-specific leading and zero tracking so diacritics never clip.
- **Accessibility first:** reduced-motion kill switches, reduced-transparency fallbacks, and a "Sensitive Mode" that lowers contrast and strips animation on demand.

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) + React 19 |
| Styling | Tailwind CSS v4, glassmorphism design system |
| Language | TypeScript 5 |
| Motion | Framer Motion |
| Data | Prisma ORM over SQLite |
| AI/RAG | Local deterministic RAG pipeline (zero-hallucination grounding), optional provider (Gemini / OpenAI / Anthropic) for the companion chat |
| Icons | Hugeicons |
| Notifications | Sonner toasts + in-app notification center |
| Testing | Vitest (unit), Playwright (e2e), a11y CSS guard in CI |
| PWA | Service worker + manifest + offline fallback page |

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/mariam423/fibrocare.git
cd fibrocare

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (`.env.local`)

The app runs with **no keys at all** — the deterministic insight engines, RAG grounding, and offline AI fallbacks work out of the box. Add keys only for live features:

```env
# ── Database (SQLite — works as-is) ──
DATABASE_URL="file:./dev.db"

# ── Weather (optional — dashboard falls back to deterministic estimates) ──
OPENWEATHER_API_KEY=your_openweather_key
OPENWEATHER_CITY=London

# ── Public origin (for SEO/social metadata) ──
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ── AI Care Companion (optional — any ONE provider key enables live chat) ──
# GEMINI_API_KEY=...   # recommended — free tier available
# OPENAI_API_KEY=...
# ANTHROPIC_API_KEY=...
```

### Verification

```bash
npm test          # full Vitest suite (455+ unit tests — must be 100% passing)
npx tsc --noEmit  # zero TypeScript errors
npm run build     # production build + PWA service-worker precache
```

---

## ⚕️ Medical Disclaimer & Sources

FibroCare is a **wellness and self-tracking tool — not a medical device, and never a substitute for professional care.** It does not diagnose, treat, or cure fibromyalgia; always consult your physician or a qualified healthcare provider about your symptoms and treatment plan.

AI-generated content (summaries, action plans, meal swaps, and FAQ answers) is **grounded in and cited against established clinical frameworks**, including:

- **American College of Rheumatology (ACR)** — fibromyalgia diagnostic criteria (2010/2016 WPI & SSS)
- **Mayo Clinic** — clinical overviews, symptom guidance, and management approaches
- **NHS** — patient education and self-management resources
- **EULAR** — management recommendations for fibromyalgia

Where a claim cannot be matched to a verified source in the local knowledge base, FibroCare deliberately shows a safe, general offline note **instead of generating ungrounded advice** (zero-hallucination policy). Every cited claim is one click away from its source via the "Verified Source" badge.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
