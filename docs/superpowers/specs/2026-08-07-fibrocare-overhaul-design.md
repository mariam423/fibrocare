# FibroCare Comprehensive Overhaul Design Spec
Date: 2026-08-07
Status: Approved

## 1. Vision & Goals
Transform FibroCare from a basic symptom tracker into an empathetic, state-aware health companion for fibromyalgia patients. The core focus is reducing cognitive load (fighting "Fibro Fog") and providing immediate, restorative support during flare-ups.

## 2. Architecture: The State-Aware Shell
The application will move from a static UI to a dynamic "Personality" system.

### 2.1 Global Health State Manager (`HealthContext`)
A React Context provider wrapping the app to track:
- `currentPainLevel`: 0-10
- `isFlareUp`: Boolean (derived: pain >= 7 or high-severity symptom clusters)
- `activeTheme`: `Standard` | `Sensitive`
- `motionEnabled`: Boolean (Global animation kill-switch)

### 2.2 State-to-UI Bridge
- **Automatic Trigger:** Detection of `isFlareUp = true` triggers a "Sensitive Mode" suggestion.
- **Dynamic Theme Injection:** CSS variables will shift from Productive Pastels (Lavender/Teal) to a Soothing Palette (Deep Navy/Sage Green) globally.
- **Animation Control:** All motion-based components will read `motionEnabled` from context to disable transitions during high-sensitivity states.

---

## 3. User Interface: "Gentle" Components

### 3.1 The Gentle Log System
Designed to minimize "Fibro Fog" fatigue:
- **Quick Presets:** Large, soft-edged chips (`Calm Day`, `Mild Flare`, `Severe Flare`) for 1-tap baseline entry.
- **Emoji-Sensation Grid:** Tactile tiles with large emojis and simple labels for symptom selection.
- **Fluid Pain Slider:** A color-morphing slider (Teal $\rightarrow$ Purple $\rightarrow$ Orange) providing visual feedback of pain intensity.

### 3.2 The Zen Portal (Calming Space)
A dedicated restorative environment:
- **Visual Breathing Bubble:** A central, organic sine-wave animated circle guiding inhalation and exhalation.
- **Soundscape Mixer:** Simple On/Off toggles for looping audio (Rain, Forest, White Noise, Deep Hum).
- **Ultra-Dark Mode:** A high-contrast "sensory deprivation" toggle removing all UI except the breathing bubble.

### 3.3 Smart Support Triggers
- **Empathetic Toasts:** Soft notifications triggered by high pain logs.
- **Actionable Recovery Cards:** Context-aware suggestions (e.g., "Try a cold compress" or "3-min Breathing Exercise").

### 3.4 Sensitive Control Center
- **Palette Picker:** Choice of "Safe Colors" (Sage, Navy, Lavender).
- **Stillness Switch:** Global toggle to disable all animations.

---

## 4. Data Flow & Medical Intelligence

### 4.1 The Empathetic Loop
`Capture` $\rightarrow$ `Context Update` $\rightarrow$ `UI Adaptation` $\rightarrow$ `Support Trigger`.

### 4.2 Insight Engine (Pattern Discovery)
A backend service analyzing correlations:
- **Correlation Logic:** Comparing pain levels across variables (e.g., Hydration < 4 glasses vs. Pain > 7).
- **Human-Readable Insights:** Generation of natural language tips based on data (e.g., "Your pain spikes on low-hydration days").

### 4.3 Medical Reporting (The Doctor's PDF)
A professional summary export including:
- **Executive Summary:** 30-day avg pain, total flare-up days, top 3 symptoms.
- **Visual Trend:** High-contrast, print-ready pain charts.
- **Correlation Summary:** Key insights from the engine.
- **Raw Log Annex:** Clean tabular data for full clinical context.

---

## 5. Privacy & Security
- **Auth:** NextAuth.js supporting Email and Social Logins.
- **Privacy Lock:** Optional app-level PIN/Biometric lock using WebAuthn API.
- **Data Storage:** Secure cloud-synced SQLite via Prisma.

## 6. Success Criteria
- Reduction in time to log daily entries.
- High user adoption of the "Zen Portal" during logged flare-ups.
- Generation of clinically useful PDF reports.
