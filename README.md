# FibroCare

FibroCare is a web app for people living with fibromyalgia. It helps track pain and energy day to day, and packages the results into something a doctor can actually use. It installs as a PWA and keeps working offline.

## What it does

The daily check-in is built around Spoon Theory: you log your energy for the day alongside pain intensity and symptoms. A body map lets you mark where it hurts, front and back.

For doctor visits, the app generates a 30/90-day clinical report as a PDF, or you can share a PIN-protected live dashboard link with your specialist instead of printing anything.

It also watches local weather (humidity, pressure, temperature) against your logged flares, so over time it can tell you things like "humidity is running 15% above your normal, maybe go easy today". When things get bad there's a flare mode: one tap dims the visuals, starts a paced breathing guide, and pulls up calming audio that plays offline.

The AI companion is optional. If you add a Gemini, OpenAI, or Anthropic key it becomes a chat that already knows your recent logs and answers in a grounded way, with your data staying on the server. With no key the app works fine without it: the deterministic insight engines still run, and the AI surfaces show a quiet offline hint instead of breaking.

## Stack

Next.js (App Router, TypeScript) with Tailwind, Framer Motion, and Radix UI on the frontend. Prisma over SQLite for data. The AI parts use the Vercel AI SDK. Tests are Playwright for e2e and Vitest for units, plus a homegrown static CSS check that fails the build if the accessibility fallbacks in `globals.css` get removed.

## Getting started

```bash
git clone https://github.com/mariam423/fibrocare.git
cd fibrocare
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000. No AI key is required to use it.

If you want the companion live, add one of these to `.env.local`:

```bash
# Google Gemini (free tier, no card needed)
AI_PROVIDER=google
GEMINI_API_KEY=your_key

# or OpenAI / Anthropic
# OPENAI_API_KEY=...      # default model gpt-4o-mini
# ANTHROPIC_API_KEY=...   # default model claude-haiku-4-5
# AI_MODEL=...            # optional override
```

## Notes

- Arabic and English are both supported, with RTL layout for Arabic.
- The service worker precaches the whole app shell, so a fresh install works with no prior visit.
- The app is a self-tracking aid. It does not diagnose anything and does not replace a care team.

MIT licensed.
