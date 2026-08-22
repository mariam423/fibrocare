# FibroCare 🌿 — Empathetic Health Companion for Fibromyalgia

FibroCare is a specialized, accessibility-first web application and PWA designed to empower individuals with Fibromyalgia and bridge the gap between patients and their healthcare providers.

---

## ✨ Key Features

- **Spoon Tracker & Daily Check-in:** Monitor energy levels using the Spoon Theory framework alongside physical symptoms and pain intensity.
- **Interactive Body Pain Map:** Visual tracking of tender points and pain spread across 2.5D glass surfaces.
- **Doctor Portal & Secure Clinical PDF:** Generate a 30/90-day clinical report or share a password/PIN-protected live dashboard link with specialists.
- **Predictive Weather & Flare Insights:** Correlate local weather metrics (humidity, pressure, temp) with logged flares to anticipate tough days.
- **Flare Emergency Mode:** Single-tap activation for sensory-dimmed overlays, breathing guides, and immediate calming protocols.
- **AI Care Companion:** Empathy-driven, privacy-focused streaming AI assistant grounded in recent health snapshots (supports Gemini, OpenAI, Anthropic, or offline mock mode).
- **PWA & Offline First:** Fully installable on iOS/Android/Desktop with Workbox service workers for uninterrupted offline logging.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS, Framer Motion, Radix UI, Glassmorphism Design System
- **State & Database:** Prisma, React Context
- **AI Integration:** Vercel AI SDK
- **Testing & Accessibility:** Playwright, Vitest, Custom Static CSS A11y Guard

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mariam423/fibrocare.git
   cd fibrocare
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add at least one AI provider key (or skip it — the app stays fully functional in offline mode):
   ```bash
   # Google Gemini (recommended, free tier usable, no card needed)
   AI_PROVIDER=google
   GEMINI_API_KEY=your_key

   # …or OpenAI / Anthropic
   # OPENAI_API_KEY=...      # default model gpt-4o-mini
   # ANTHROPIC_API_KEY=...   # default model claude-haiku-4-5
   # AI_MODEL=...            # optional override
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📜 License

This project is licensed under the MIT License.
