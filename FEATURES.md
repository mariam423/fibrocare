# Features

A closer look at the two halves of FibroCare: the **crisis & fog modules** you open when thinking hurts, and the **clinical modules** you use to understand your patterns over weeks and months. For setup, architecture, and testing, see the [README](./README.md). This page is also available [in Arabic](./FEATURES_AR.md).

---

## Table of contents

- [Crisis & Fog Support](#crisis--fog-support)
  - [SOS floating button](#sos-floating-button)
  - [Fog Shield](#fog-shield)
  - [Family support cards](#family-support-cards)
  - [Gentle movement reminders](#gentle-movement-reminders)
  - [Spoon check-in & Energy Saving Mode](#spoon-check-in--energy-saving-mode)
  - [Pantry meal helper](#pantry-meal-helper)
  - [Medical summary](#medical-summary)
- [Clinical Hub](#clinical-hub)
  - [Clinical trackers](#clinical-trackers)
  - [ACR assessment](#acr-assessment)
  - [Exercise library](#exercise-library)
  - [Sleep hygiene guide](#sleep-hygiene-guide)
  - [Coping toolkit](#coping-toolkit)
  - [Weekly/Monthly report](#weeklymonthly-report)
- [Cross-cutting](#cross-cutting)

---

## Crisis & Fog Support

These modules share one design rule: **they must work when you can barely think.** Large touch targets, no menus to navigate, high-contrast text, and everything works in a single tap.

### SOS floating button

**Where:** dashboard and inner app pages only (mounted in the root layout, hidden on `/`, auth, legal, and utility routes) · **Route:** none — it's an overlay

A floating action button on the app's inner pages, with a small dismiss (X) mark so the user can hide it at any time. One tap opens a full-screen crisis overlay with:

- **Breathing countdown** — a paced 4-7-8 cycle; after about a minute it settles into a "you're safe now" state, with the circle animating at the actual 4/7/8 rhythm.
- **Pre-formatted emergency message** — a ready-to-send note explaining you're in an unexpected flare. Uses the Web Share API when available, with clipboard-copy fallback. Generated in the user's current language.
- **High-contrast dizziness guidance** — four large-type steps for managing dizziness and disorientation, readable mid-flare.
- **Emergency call button** — links to your local emergency number.

*Design notes: 56px touch target, `aria-expanded`/`aria-haspopup` wiring, Escape closes, focus returns to the button on close.*

### Fog Shield

**Where:** quick links and toolkit · **Route:** `/fog-shield` (session/PIN protected)

An emergency module for fibro-fog episodes. Four tools on one screen:

| Tool | What it does |
|:---|:---|
| **Sensory reset breathing** | Guided breathing with an on-screen circle that scales at the guided rhythm; completing a cycle logs the tool used. |
| **Digital brain dump** | Offloads swirling thoughts into the episode's `FibroFogLog` row — encrypted at rest, never stored plaintext. |
| **Micro-task breaker** | Type an overwhelming task, get back 3 microscopic steps (engine: `src/lib/fog/microTasks.ts`). |
| **Trigger presets** | 12 presets (poor sleep, overstimulation, …) — tap what happened before the fog. |

The page is anchored by **CalmResonance3D**, a Three.js sphere that starts as a murky gray particle cloud and clears as grounding progress advances — a visible "am I getting anywhere?" signal.

Each episode is persisted: intensity (1–10), triggers, brain-dump text, coping tool used, timestamp — so weekly patterns become visible ("fog spikes after poor-sleep nights").

### Family support cards

**Where:** toolkit · **Route:** none

Three pre-written cards — flare, brain fog, and crash — that explain a state you can't explain yourself right now. One tap copies or shares (Web Share API). Generated in the user's current language, with placeholders like location and timing filled from context. Built to end the "explaining from scratch every time" burden.

### Gentle movement reminders

**Stillness detection:** inactivity windows of 20 / 30 / 45 minutes · **Snooze:** 10 minutes · **Auto-dismiss:** 90 seconds

A soft micro-stretch nudge during long study or coding sessions — one targeted micro-stretch card, a 10-minute snooze, and auto-dismiss. Never a nag: capped frequency, reduced-motion aware, dismissible everywhere.

### Spoon check-in & Energy Saving Mode

**Where:** dashboard · **Data:** `SpoonLog` Prisma model (one row per user per day)

The morning prompt asks how many energy spoons you have today (1–10). Behind it:

- **Database persistence** via session- and PIN-guarded server actions (`saveSpoonLog`, `getTodaySpoonLog`, `getSpoonWeek`).
- **Energy Saving Mode** at ≤3 spoons: the card flips to a distinct state — guidance switches from "spread your energy" to "protect and rest", and the document gets a `data-energy-saving` flag so secondary dashboard tasks can defer.
- **7-day trend strip** so you can see the shape of your week, not just today.

### Pantry meal helper

**Where:** `/diet` · **Engine:** `src/lib/diet/pantryMeals.ts`

Tick what's actually in your kitchen → get 5-minute anti-inflammatory meal ideas ordered by match, across 6 meals and 12 pantry ingredients. Every meal carries a short anti-inflammatory "why" note. No database writes, no setup — zero decision fatigue by design.

**Honest limitation:** it intentionally does *not* count calories or flag allergens. It's a decision-fatigue buster, not a nutritionist.

**Related:** `/diet` also carries dietary **trigger tracking** and a **flare-correlation panel** that cross-references meals with logged flares over time.

### Medical summary

**Where:** `/reports` · **Data:** server action `getMedicalSummary`

A one-page, print-ready summary of the last 30 days: average and peak pain, cycle days, symptom patterns, and medication/supplement adherence — formatted to survive a foggy waiting room and hand directly to your doctor. Uses the existing print stylesheet; no PDF library involved.

---

## Clinical Hub

**Route:** `/clinical` (session/PIN protected) — one dashboard mounting the trackers and every module below.

### Clinical trackers

- **Flare triggers log** — episodes tagged across 10 factors grouped into 6 categories (weather, stress, sleep, diet, activity, other), with per-factor frequency and average-severity rollups.
- **Lab results tracker** — 5 tracked lab fields with a per-test verdict engine (`labVerdict`) and "latest result per test" resolution (`latestPerTest`).
- **Medication & supplement tracker** — 7 common fibromyalgia medications and supplements preloaded (from duloxetine to magnesium citrate), with dose scheduling and adherence logging.
- **Cycle dashboard** — cycle phase and symptom correlation, powered by the cycle engines and `getCycleDashboardData`.

### ACR assessment

A guided walk through the **ACR 2016/2010 criteria**: 19 body regions for the Widespread Pain Index, an 18-item somatic symptom scale (SSS), and a verdict engine (`evaluateAcr`) producing a fibromyalgia-likelihood result. Snapshots persist so changes over time stay visible.

> This is a screening aid, not a diagnosis — and the app says so in the UI.

### Exercise library

8 low-impact exercises, filterable by intensity and body area. Each entry has a purpose, steps, a "when to skip" safety note, and pacing tips (`EXERCISE_PACING_TIPS`): pace, don't push; mild soreness is normal, pain is a stop sign.

### Sleep hygiene guide

8 trackable habits, each with the reasoning behind it (light exposure, caffeine half-life, reserving the bed for sleep…). A composite score (`sleepHygieneScore`) reads out with a plain-language interpretation tier.

### Coping toolkit

6 coping modules — pacing, breathing, grounding, heat comfort, sensory shutdown, and support outreach — plus a **guided 4-7-8 breathing exercise**: a scaling circle, phase label (inhale 4s / hold 7s / exhale 8s), per-phase countdown, and start/pause/reset. The phase math lives in a pure engine (`breathPhaseAt`, `breathSecondsLeft`), so the UI can't drift from the math.

### Weekly/Monthly report

Aggregates pain logs, cycle data, trigger entries, medications, and the ACR snapshot through the pure `buildPeriodStats` engine into a doctor-ready summary, with week and month windows computed from today.

---

## Cross-cutting

- **Bilingual by construction** — every string above renders in Arabic (RTL) and English (LTR). The pure engines are language-neutral; components pull from a `TranslationKey`-typed dictionary (~2,300 keys) and stay locale-blind.
- **Privacy & security** — clinical routes are session- and PIN-gated in middleware; brain-dump text is encrypted at rest; fog and spoon logs are per-user rows with cascade delete on account removal.
- **Pure engines, tested** — every behavior above is driven by deterministic engines in `src/lib/clinical/*`, `src/lib/fog/*`, and `src/lib/diet/*`, each with dedicated unit tests (993 tests across the suite).

---

*A self-tracking companion — not a medical device. The ACR section is a screening aid, not a diagnosis, and the app says so in the UI. Always consult your physician.*

<div align="center">

**Built with care by [@mariam423](https://github.com/mariam423).**

</div>
