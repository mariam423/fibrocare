# FibroCare Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform FibroCare into an empathetic, state-aware health companion with a "Sensitive Mode," Zen Portal, and Medical Insight engine.

**Architecture:** Experience-First Refactor using a Global Health State Manager (`HealthContext`) that dynamically adjusts the UI personality (Standard vs. Sensitive) based on pain levels and user preferences.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, SQLite, Framer Motion (for Zen animations), NextAuth.js, jsPDF (for reporting).

## Global Constraints
- Palette: Soothing Palette (Sage Green, Lavender, Deep Navy) for Sensitive Mode.
- Accessibility: Large readable typography (min 16px), low contrast option.
- Performance: No layout shift during theme transitions.
- Privacy: Sensitive health data must be handled securely.

---

### Task 1: The Empathetic Shell (Core State & Theming)
**Files:**
- Create: `src/context/HealthContext.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/styles/themes.css`

**Interfaces:**
- Produces: `HealthContext` providing `{ currentPainLevel, isFlareUp, activeTheme, motionEnabled, setHealthState }`

- [ ] **Step 1: Create `src/styles/themes.css` defining CSS variables for Standard and Sensitive palettes.**
- [ ] **Step 2: Implement `HealthContext` to manage pain levels and theme state.**
- [ ] **Step 3: Wrap `layout.tsx` with `HealthProvider`.**
- [ ] **Step 4: Implement the theme-switching logic in `layout.tsx` to apply the correct CSS class to `<html>`.**
- [ ] **Step 5: Verify that changing `activeTheme` in context updates the global UI colors.**
- [ ] **Step 6: Commit.**

### Task 2: The "Gentle Log" UI
**Files:**
- Create: `src/components/logging/QuickPresets.tsx`
- Create: `src/components/logging/EmojiGrid.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/actions.ts`

**Interfaces:**
- Consumes: `HealthContext`
- Produces: `onLogSubmit(data: LogEntry)`

- [x] **Step 1: Implement `QuickPresets` component with predefined states (Calm, Mild, Severe).**
- [x] **Step 2: Implement `EmojiGrid` for symptom selection with large, tactile tiles.**
- [x] **Step 3: Create the "Fluid" Pain Slider with dynamic color interpolation.**
- [x] **Step 4: Refactor `src/app/page.tsx` to integrate these components into a low-friction flow.**
- [x] **Step 5: Update `savePainLog` in `actions.ts` to handle preset-based data.**
- [x] **Step 6: Verify that 1-tap logging works and updates the database.**
- [ ] **Step 7: Commit.**

### Task 3: The Zen Portal (Calming Space)
**Files:**
- Create: `src/app/zen/page.tsx`
- Create: `src/components/zen/BreathingBubble.tsx`
- Create: `src/components/zen/SoundscapeMixer.tsx`

**Interfaces:**
- Consumes: `HealthContext` (for motion settings)
- Produces: `startZenSession()`

- [x] **Step 1: Create `/zen` route and basic page layout.**
- [x] **Step 2: Implement `BreathingBubble` using Framer Motion with organic sine-wave scaling.**
- [x] **Step 3: Implement `SoundscapeMixer` with looping audio assets (Rain, Forest, White Noise).**
- [x] **Step 4: Implement "Ultra-Dark" mode toggle within the Zen page.**
- [x] **Step 5: Verify that the breathing animation is smooth and sound toggles work.**
- [x] **Step 6: Commit.**

### Task 4: Smart Support & Flare-up Triggers
**Files:**
- Create: `src/components/ui/EmpatheticToast.tsx`
- Create: `src/components/support/RecoveryCards.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `HealthContext`
- Produces: `triggerSupport(type: 'sensitive' | 'zen')`

- [x] **Step 1: Implement `EmpatheticToast` for non-intrusive suggestions.**
- [x] **Step 2: Create `RecoveryCards` with specific advice (Cold compress, etc.).**
- [x] **Step 3: Add logic to `page.tsx` to trigger the toast when `painLevel >= 7`.**
- [x] **Step 4: Link the toast actions to the Sensitive Mode toggle and Zen Portal.**
- [x] **Step 5: Verify that logging high pain triggers the empathetic support flow.**
- [x] **Step 6: Commit.**

### Task 5: Insight Engine & Medical Reporting
**Files:**
- Create: `src/lib/insightEngine.ts`
- Create: `src/lib/pdfGenerator.ts`
- Create: `src/app/reports/page.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `PrismaClient`
- Produces: `getInsights(): Insight[]`, `generatePDF(): Promise<Blob>`

- [x] **Step 1: Implement `insightEngine.ts` to correlate hydration/sleep with pain spikes.**
- [x] **Step 2: Implement `pdfGenerator.ts` using `jspdf` to create the clinical summary.**
- [x] **Step 3: Create the `/reports` page to preview and download the PDF.**
- [x] **Step 4: Integrate "AI Insight" cards on the main dashboard.**
- [x] **Step 5: Verify that the PDF contains the 30-day summary and correlation data.**
- [x] **Step 6: Commit.**

### Task 6: Security & Privacy Lock
**Files:**
- Create: `src/components/auth/PrivacyLock.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/api/auth/[...nextauth]/route.ts` (or equivalent)

**Interfaces:**
- Consumes: `HealthContext`
- Produces: `isLocked: boolean`, `unlock()`

- [x] **Step 1: Implement the `PrivacyLock` screen (PIN entry).**
- [x] **Step 2: Add a global guard in `layout.tsx` that shows the lock screen if enabled.**
- [x] **Step 3: Configure NextAuth.js for Social Logins (Google/GitHub).**
- [x] **Step 4: Verify that logs are inaccessible until the PIN is entered.**
- [x] **Step 5: Commit.**
